import {
  BacktestMetrics,
  ComparisonField,
  ConfusionMatrix,
  CsvValidationResult,
  DecisionState,
  FlaggedPeb,
  PebRecord,
  RefBkRow,
  RuleCode,
  RuleConfig,
  ScreeningSummary,
  StatusTanda,
  TimelineEvent,
} from '../types/tepat';

export const REQUIRED_CSV_COLUMNS = [
  'nomor_peb',
  'tanggal_peb',
  'eksportir',
  'komoditas',
  'uraian_barang',
  'pos_tarif',
  'nilai_fob',
  'jumlah',
  'tarif_diberitahukan',
] as const;

export const BATAS_PRIORITAS_RUPIAH = 50_000_000;
export const BATAS_PENETAPAN_HARI = 30;

interface DictionaryRuleEntry {
  id: string;
  komoditasBenar: string;
  posTarifBenar: string;
  includePattern: RegExp;
  excludePattern?: RegExp;
}

/**
 * Kamus presisi untuk aturan R3 (uraian barang vs pos tarif).
 * Mengecualikan CPKO / inti sawit / minyak kelapa agar tidak terjadi tanda palsu
 * seperti aturan naif yang sekadar mencari kata "CRUDE".
 */
export const KAMUS_URAIAN_POS: DictionaryRuleEntry[] = [
  {
    id: 'CPO',
    komoditasBenar: 'CPO',
    posTarifBenar: '1511.10.00',
    includePattern: /\b(CPO|CRUDE PALM OIL|MINYAK SAWIT MENTAH)\b/i,
    excludePattern: /\b(CPKO|PKO|KERNEL|INTI SAWIT|COCONUT|KELAPA)\b/i,
  },
  {
    id: 'CPKO',
    komoditasBenar: 'CPKO',
    posTarifBenar: '1513.21.10',
    includePattern: /\b(CPKO|CRUDE PALM KERNEL OIL|MINYAK INTI SAWIT MENTAH)\b/i,
  },
  {
    id: 'CCO',
    komoditasBenar: 'Crude Coconut Oil',
    posTarifBenar: '1513.11.00',
    includePattern: /\b(CRUDE COCONUT OIL|MINYAK KELAPA MENTAH)\b/i,
  },
];

/** Format angka bulat dengan pemisah ribuan titik ala Indonesia */
export function formatAngka(nilai: number, desimal = 0): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: desimal,
    maximumFractionDigits: desimal,
  }).format(nilai);
}

/** Format persentase dengan koma desimal Indonesia (misal 7,5% atau 10%) */
export function formatPersen(nilai: number, maxDesimal = 2): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: Number.isInteger(nilai) ? 0 : 1,
    maximumFractionDigits: maxDesimal,
  }).format(nilai);
  return `${formatted}%`;
}

/** Format angka ke Rupiah penuh tanpa desimal dengan spasi konsisten ("Rp 120.000.000") */
export function formatRupiah(nilai: number): string {
  const rounded = Math.round(nilai);
  const absFormatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(rounded));
  return rounded < 0 ? `-Rp ${absFormatted}` : `Rp ${absFormatted}`;
}

/** Format angka ke satuan Rp juta dengan 1 angka desimal (misal "155,0" atau "1.911,5") */
export function formatRpJuta(nilai: number): string {
  const juta = nilai / 1_000_000;
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(juta);
}

/** Format tanggal YYYY-MM-DD menjadi DD MMM YYYY (Bahasa Indonesia) */
export function formatTanggalId(tanggal: string): string {
  const parts = tanggal.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return tanggal;
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Hitung umur PEB (dalam hari kalender) dan sisa hari terhadap batas 30 hari */
export function computeUmurDanSisaHari(
  tanggalPeb: string,
  referenceDate: Date
): { umurHari: number; sisaHari: number } {
  const [y, m, d] = tanggalPeb.split('-').map(Number);
  if (!y || !m || !d) return { umurHari: 0, sisaHari: BATAS_PENETAPAN_HARI };

  const pebUtc = Date.UTC(y, m - 1, d);
  const refUtc = Date.UTC(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  const diffDays = Math.floor((refUtc - pebUtc) / (1000 * 60 * 60 * 24));
  const umurHari = Math.max(0, diffDays);
  const sisaHari = BATAS_PENETAPAN_HARI - umurHari;
  return { umurHari, sisaHari };
}

/** Cari baris rujukan Ref_BK berdasarkan bulan PEB dan komoditas atau pos tarif */
export function findRefBkRow(
  refRows: RefBkRow[],
  bulan: string,
  posTarif: string,
  komoditas?: string
): RefBkRow | undefined {
  const byPos = refRows.find(
    (row) => row.bulan === bulan && row.pos_tarif.trim() === posTarif.trim()
  );
  if (byPos) return byPos;

  if (komoditas) {
    const norm = komoditas.trim().toLowerCase();
    const byKom = refRows.find(
      (row) => row.bulan === bulan && row.komoditas.trim().toLowerCase() === norm
    );
    if (byKom) return byKom;
  }

  // Fallback ke bulan terbaru untuk pos/komoditas sama bila bulan spesifik belum diisi
  return refRows.find(
    (row) =>
      row.pos_tarif.trim() === posTarif.trim() ||
      (komoditas && row.komoditas.trim().toLowerCase() === komoditas.trim().toLowerCase())
  );
}

export interface RuleMatchResult {
  aturan: RuleCode;
  dugaanKesalahan: string;
  perkiraanSelisih: number;
  refMatched?: RefBkRow;
  perbandingan: ComparisonField[];
}

/**
 * R1: Tarif bulan — membandingkan tarif_diberitahukan pada PEB dengan
 * tarif jenjang harga referensi bulan PEB di tabel Ref_BK.
 */
export function evaluateRuleR1(
  peb: PebRecord,
  refRows: RefBkRow[]
): RuleMatchResult | null {
  const bulan = peb.tanggal_peb.slice(0, 7);
  const ref = findRefBkRow(refRows, bulan, peb.pos_tarif, peb.komoditas);
  if (!ref || ref.tarif === null) return null;

  const selisihTarif = Number((ref.tarif - peb.tarif_diberitahukan).toFixed(4));
  if (Math.abs(selisihTarif) < 0.0001) return null;

  const perkiraanSelisih = ((ref.tarif - peb.tarif_diberitahukan) / 100) * peb.nilai_fob;

  return {
    aturan: 'R1',
    dugaanKesalahan: `Tarif BK diberitahukan ${formatPersen(peb.tarif_diberitahukan)} tidak sesuai tarif Ref_BK ${formatPersen(ref.tarif)} (${ref.jenjang_harga})`,
    perkiraanSelisih: Math.max(0, Math.round(perkiraanSelisih)),
    refMatched: ref,
    perbandingan: [
      {
        label: 'Tarif Bea Keluar',
        nilaiPeb: formatPersen(peb.tarif_diberitahukan),
        nilaiRujukan: `${formatPersen(ref.tarif)} (${ref.jenjang_harga})`,
        berbeda: true,
      },
      {
        label: 'Bulan Rujukan & Komoditas',
        nilaiPeb: `${bulan} · ${peb.komoditas}`,
        nilaiRujukan: `${ref.bulan} · ${ref.komoditas}`,
        berbeda: false,
      },
      {
        label: 'Dasar Pengenaan (FOB)',
        nilaiPeb: formatRupiah(peb.nilai_fob),
        nilaiRujukan: formatRupiah(peb.nilai_fob),
        berbeda: false,
      },
      {
        label: 'Bea Keluar Seharusnya vs Diberitahukan',
        nilaiPeb: formatRupiah((peb.tarif_diberitahukan / 100) * peb.nilai_fob),
        nilaiRujukan: formatRupiah((ref.tarif / 100) * peb.nilai_fob),
        berbeda: true,
      },
    ],
  };
}

/**
 * R2: Harga dasar kakao — menandai PEB komoditas kakao yang nilai FOB per satuannya
 * lebih rendah dari HPE bulan PEB di tabel Ref_BK.
 */
export function evaluateRuleR2(
  peb: PebRecord,
  refRows: RefBkRow[]
): RuleMatchResult | null {
  const isKakao =
    peb.pos_tarif.startsWith('18') ||
    peb.komoditas.toLowerCase().includes('kakao') ||
    peb.komoditas.toLowerCase().includes('cokelat');
  if (!isKakao || peb.jumlah <= 0) return null;

  const bulan = peb.tanggal_peb.slice(0, 7);
  const ref = findRefBkRow(refRows, bulan, peb.pos_tarif, peb.komoditas);
  if (!ref || ref.hpe === null) return null;

  const fobPerSatuan = peb.nilai_fob / peb.jumlah;
  if (fobPerSatuan >= ref.hpe - 1) return null;

  const tarifBerlaku = ref.tarif ?? peb.tarif_diberitahukan;
  const selisihFobTotal = (ref.hpe - fobPerSatuan) * peb.jumlah;
  const perkiraanSelisih = selisihFobTotal * (tarifBerlaku / 100);

  return {
    aturan: 'R2',
    dugaanKesalahan: `Nilai FOB/MT (${formatRupiah(fobPerSatuan)}) lebih rendah dari HPE ${bulan} (${formatRupiah(ref.hpe)}/MT)`,
    perkiraanSelisih: Math.max(0, Math.round(perkiraanSelisih)),
    refMatched: ref,
    perbandingan: [
      {
        label: 'Nilai FOB per Satuan (Rp/MT)',
        nilaiPeb: `${formatRupiah(fobPerSatuan)}/MT`,
        nilaiRujukan: `${formatRupiah(ref.hpe)}/MT (HPE ${ref.bulan})`,
        berbeda: true,
      },
      {
        label: 'Total Nilai FOB vs Dasar HPE',
        nilaiPeb: formatRupiah(peb.nilai_fob),
        nilaiRujukan: formatRupiah(ref.hpe * peb.jumlah),
        berbeda: true,
      },
      {
        label: 'Kuantitas & Tarif Berlaku',
        nilaiPeb: `${formatAngka(peb.jumlah)} MT · ${formatPersen(peb.tarif_diberitahukan)}`,
        nilaiRujukan: `${formatAngka(peb.jumlah)} MT · ${formatPersen(tarifBerlaku)}`,
        berbeda: false,
      },
    ],
  };
}

/**
 * R3: Uraian terhadap pos — mencocokkan kamus uraian barang yang presisi
 * dengan pos tarif yang diberitahukan (misal CPO dalam flexibag pada pos olein 1511.90.37).
 */
export function evaluateRuleR3(
  peb: PebRecord,
  refRows: RefBkRow[]
): RuleMatchResult | null {
  const uraian = peb.uraian_barang.trim();
  const bulan = peb.tanggal_peb.slice(0, 7);

  for (const entry of KAMUS_URAIAN_POS) {
    const matchesInclude = entry.includePattern.test(uraian);
    const matchesExclude = entry.excludePattern
      ? entry.excludePattern.test(uraian)
      : false;

    if (matchesInclude && !matchesExclude && peb.pos_tarif.trim() !== entry.posTarifBenar) {
      const refBenar = findRefBkRow(
        refRows,
        bulan,
        entry.posTarifBenar,
        entry.komoditasBenar
      );
      const tarifSeharusnya = refBenar?.tarif ?? peb.tarif_diberitahukan;
      const perkiraanSelisih = Math.max(
        0,
        Math.round(((tarifSeharusnya - peb.tarif_diberitahukan) / 100) * peb.nilai_fob)
      );

      return {
        aturan: 'R3',
        dugaanKesalahan: `Uraian mengindikasikan ${entry.komoditasBenar} (pos tepat ${entry.posTarifBenar}), tetapi pos diberitahukan ${peb.pos_tarif}`,
        perkiraanSelisih,
        refMatched: refBenar,
        perbandingan: [
          {
            label: 'Pos Tarif (HS Code)',
            nilaiPeb: peb.pos_tarif,
            nilaiRujukan: `${entry.posTarifBenar} (${entry.komoditasBenar})`,
            berbeda: true,
          },
          {
            label: 'Tarif Bea Keluar Terkait Pos',
            nilaiPeb: `${formatPersen(peb.tarif_diberitahukan)} (${peb.komoditas})`,
            nilaiRujukan: `${formatPersen(tarifSeharusnya)} (${entry.komoditasBenar})`,
            berbeda: tarifSeharusnya !== peb.tarif_diberitahukan,
          },
          {
            label: 'Uraian Barang pada PEB',
            nilaiPeb: peb.uraian_barang,
            nilaiRujukan: `Kata kunci kamus: ${entry.id} -> ${entry.posTarifBenar}`,
            berbeda: true,
          },
        ],
      };
    }
  }

  return null;
}

/** Evaluasi satu PEB terhadap aturan yang sedang aktif */
export function evaluateSinglePeb(
  peb: PebRecord,
  refRows: RefBkRow[],
  activeRules: RuleConfig
): RuleMatchResult | null {
  if (activeRules.R3) {
    const r3 = evaluateRuleR3(peb, refRows);
    if (r3) return r3;
  }
  if (activeRules.R1) {
    const r1 = evaluateRuleR1(peb, refRows);
    if (r1) return r1;
  }
  if (activeRules.R2) {
    const r2 = evaluateRuleR2(peb, refRows);
    if (r2) return r2;
  }
  return null;
}

/**
 * Menyaring seluruh batch PEB dan menghasilkan daftar FlaggedPeb + ringkasan.
 * Aplikasi HANYA menandai: tertundaPemuatan selalu 0 (target 0%).
 */
export function screenPebBatch(
  pebs: PebRecord[],
  refRows: RefBkRow[],
  activeRules: RuleConfig,
  referenceDate: Date,
  decisionMap: Record<string, DecisionState>,
  runTimestampLabel: string
): { flagged: FlaggedPeb[]; summary: ScreeningSummary } {
  const flagged: FlaggedPeb[] = [];
  const jumlahPerAturan: Record<RuleCode, number> = { R1: 0, R2: 0, R3: 0 };
  const nilaiPerAturan: Record<RuleCode, number> = { R1: 0, R2: 0, R3: 0 };
  let totalSelisih = 0;

  for (const peb of pebs) {
    const match = evaluateSinglePeb(peb, refRows, activeRules);
    if (!match) continue;

    const { umurHari, sisaHari } = computeUmurDanSisaHari(
      peb.tanggal_peb,
      referenceDate
    );

    const prioritas =
      match.perkiraanSelisih > BATAS_PRIORITAS_RUPIAH
        ? 'Prioritas verifikasi'
        : 'Reguler';

    const existing = decisionMap[peb.nomor_peb];
    const defaultStatus: StatusTanda = existing?.status ?? 'Baru';
    const defaultTimeline: TimelineEvent[] = existing?.riwayat ?? [
      {
        id: `sys-${peb.nomor_peb}`,
        tahap: 'Ditandai sistem',
        waktu: `${peb.tanggal_peb} H+1 07:00 WIB`,
        oleh: 'Mesin Saringan TEPAT',
        keterangan: `Ditandai oleh aturan ${match.aturan}: ${match.dugaanKesalahan}`,
      },
    ];

    flagged.push({
      peb,
      aturan: match.aturan,
      dugaanKesalahan: match.dugaanKesalahan,
      perkiraanSelisih: match.perkiraanSelisih,
      sisaHari,
      umurHari,
      prioritas,
      status: defaultStatus,
      catatanPejabat: existing?.catatanPejabat ?? '',
      keputusanTerakhir: existing?.keputusanTerakhir,
      ditandaiPalsu: existing?.ditandaiPalsu ?? false,
      refMatched: match.refMatched,
      perbandingan: match.perbandingan,
      riwayat: defaultTimeline,
    });

    jumlahPerAturan[match.aturan] += 1;
    nilaiPerAturan[match.aturan] += match.perkiraanSelisih;
    totalSelisih += match.perkiraanSelisih;
  }

  return {
    flagged,
    summary: {
      totalDisaring: pebs.length,
      totalBertanda: flagged.length,
      totalSelisih,
      tertundaPemuatan: 0, // Tidak pernah menahan pemuatan barang
      jumlahPerAturan,
      nilaiPerAturan,
      terakhirDijalankan: runTimestampLabel,
    },
  };
}

/** Hitung matriks kebingungan 2x2 terhadap label uji balik pada dataset */
function calculateMatrix(
  pebs: PebRecord[],
  refRows: RefBkRow[],
  activeRules: RuleConfig
): ConfusionMatrix {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;

  for (const peb of pebs) {
    const match = evaluateSinglePeb(peb, refRows, activeRules);
    const predictedPositive = match !== null;
    const actualPositive =
      peb._label_uji_balik !== undefined && peb._label_uji_balik !== 'BERSIH';

    if (predictedPositive && actualPositive) tp += 1;
    else if (predictedPositive && !actualPositive) fp += 1;
    else if (!predictedPositive && actualPositive) fn += 1;
    else tn += 1;
  }

  return { tp, fp, fn, tn, total: pebs.length };
}

/**
 * Menghitung uji balik (backtest) nyata langsung dari dataset PEB contoh
 * beserta perbandingan aturan naif ("memuat CRUDE") dan aturan longgar ("semua flexibag").
 */
export function computeBacktestMetrics(
  pebs: PebRecord[],
  refRows: RefBkRow[],
  activeRules: RuleConfig
): BacktestMetrics {
  const pebs2024_2025 = pebs.filter(
    (p) => p.tanggal_peb.startsWith('2024') || p.tanggal_peb.startsWith('2025')
  );
  const pebs2026 = pebs.filter((p) => p.tanggal_peb.startsWith('2026'));

  // Aturan naif: menandai setiap PEB yang uraiannya memuat kata "CRUDE" namun pos bukan 1511.10.00
  let naifTp = 0;
  let naifFp = 0;
  // Aturan longgar: menandai setiap PEB yang uraiannya memuat "FLEXIBAG" namun pos bukan 1511.10.00
  let flexTp = 0;
  let flexFp = 0;

  for (const peb of pebs) {
    const actualPositive =
      peb._label_uji_balik !== undefined && peb._label_uji_balik !== 'BERSIH';
    const uraianUpper = peb.uraian_barang.toUpperCase();
    const pos = peb.pos_tarif.trim();

    if (uraianUpper.includes('CRUDE') && pos !== '1511.10.00') {
      if (actualPositive) naifTp += 1;
      else naifFp += 1;
    }

    if (uraianUpper.includes('FLEXIBAG') && pos !== '1511.10.00') {
      if (actualPositive) flexTp += 1;
      else flexFp += 1;
    }
  }

  return {
    semua: calculateMatrix(pebs, refRows, activeRules),
    periode2024_2025: calculateMatrix(pebs2024_2025, refRows, activeRules),
    periode2026: calculateMatrix(pebs2026, refRows, activeRules),
    aturanNaifCrude: { tp: naifTp, fp: naifFp },
    aturanLonggarFlexibag: { tp: flexTp, fp: flexFp },
  };
}

/** Parser CSV sederhana yang mendukung tanda kutip ganda */
function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Validasi dan parsing file CSV PEB.
 * Mengembalikan jumlah baris terbaca dan pesan galat terstruktur dalam Bahasa Indonesia.
 */
export function parsePebCsv(csvText: string): CsvValidationResult {
  const cleaned = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleaned) {
    return {
      valid: false,
      rowsRead: 0,
      records: [],
      errors: ['Berkas CSV kosong. Unggah berkas dengan header dan minimal satu baris data PEB.'],
    };
  }

  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      valid: false,
      rowsRead: 0,
      records: [],
      errors: ['Berkas CSV hanya berisi baris judul. Tambahkan minimal satu baris data PEB.'],
    };
  }

  const delimiter = lines[0].includes(';') && !lines[0].includes(',') ? ';' : ',';
  const headers = splitCsvLine(lines[0], delimiter).map((h) =>
    h.toLowerCase().replace(/^"|"$/g, '').trim()
  );

  const missingColumns = REQUIRED_CSV_COLUMNS.filter(
    (col) => !headers.includes(col)
  );
  if (missingColumns.length > 0) {
    return {
      valid: false,
      rowsRead: 0,
      records: [],
      errors: [
        `Kolom wajib tidak ditemukan: ${missingColumns.join(', ')}. Pastikan urutan/nama kolom sesuai standar.`,
      ],
    };
  }

  const idx = Object.fromEntries(
    REQUIRED_CSV_COLUMNS.map((col) => [col, headers.indexOf(col)])
  ) as Record<(typeof REQUIRED_CSV_COLUMNS)[number], number>;

  const records: PebRecord[] = [];
  const errors: string[] = [];

  for (let rowIdx = 1; rowIdx < lines.length; rowIdx += 1) {
    const cells = splitCsvLine(lines[rowIdx], delimiter);
    const nomor_peb = cells[idx.nomor_peb] ?? '';
    const tanggal_peb = cells[idx.tanggal_peb] ?? '';
    const eksportir = cells[idx.eksportir] ?? '';
    const komoditas = cells[idx.komoditas] ?? '';
    const uraian_barang = cells[idx.uraian_barang] ?? '';
    const pos_tarif = cells[idx.pos_tarif] ?? '';
    const nilaiFobRaw = (cells[idx.nilai_fob] ?? '').replace(/[^\d.-]/g, '');
    const jumlahRaw = (cells[idx.jumlah] ?? '').replace(/[^\d.-]/g, '');
    const tarifRaw = (cells[idx.tarif_diberitahukan] ?? '').replace(/[^\d.-]/g, '');

    const nilai_fob = Number(nilaiFobRaw);
    const jumlah = Number(jumlahRaw);
    const tarif_diberitahukan = Number(tarifRaw);

    if (!nomor_peb || !eksportir || !komoditas || !pos_tarif) {
      errors.push(`Baris ${rowIdx + 1}: nomor_peb, eksportir, komoditas, atau pos_tarif kosong.`);
      continue;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal_peb)) {
      errors.push(`Baris ${rowIdx + 1} (${nomor_peb}): format tanggal_peb harus YYYY-MM-DD (ditemukan "${tanggal_peb}").`);
      continue;
    }
    if (!Number.isFinite(nilai_fob) || nilai_fob <= 0) {
      errors.push(`Baris ${rowIdx + 1} (${nomor_peb}): nilai_fob harus berupa angka lebih dari 0.`);
      continue;
    }
    if (!Number.isFinite(jumlah) || jumlah <= 0) {
      errors.push(`Baris ${rowIdx + 1} (${nomor_peb}): jumlah harus berupa angka lebih dari 0.`);
      continue;
    }
    if (!Number.isFinite(tarif_diberitahukan) || tarif_diberitahukan < 0) {
      errors.push(`Baris ${rowIdx + 1} (${nomor_peb}): tarif_diberitahukan harus berupa angka >= 0.`);
      continue;
    }

    records.push({
      nomor_peb,
      tanggal_peb,
      eksportir,
      komoditas,
      uraian_barang,
      pos_tarif,
      nilai_fob,
      jumlah,
      tarif_diberitahukan,
    });
  }

  return {
    valid: errors.length === 0 && records.length > 0,
    rowsRead: records.length,
    records,
    errors,
  };
}

/** Ekspor daftar PEB bertanda menjadi string CSV siap unduh */
export function exportFlaggedToCsv(items: FlaggedPeb[]): string {
  const header = [
    'nomor_peb',
    'tanggal_peb',
    'eksportir',
    'komoditas',
    'pos_tarif',
    'aturan',
    'dugaan_kesalahan',
    'perkiraan_selisih_rp',
    'sisa_hari_penetapan',
    'prioritas',
    'status',
    'catatan_pejabat',
  ].join(',');

  const escapeCsv = (val: string | number) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = items.map((item) =>
    [
      item.peb.nomor_peb,
      item.peb.tanggal_peb,
      item.peb.eksportir,
      item.peb.komoditas,
      item.peb.pos_tarif,
      item.aturan,
      item.dugaanKesalahan,
      item.perkiraanSelisih,
      item.sisaHari,
      item.prioritas,
      item.status,
      item.catatanPejabat,
    ]
      .map(escapeCsv)
      .join(',')
  );

  return [header, ...rows].join('\n');
}
