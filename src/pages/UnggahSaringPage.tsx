import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Play,
  Plus,
  RotateCcw,
  Upload,
} from 'lucide-react';
import {
  REQUIRED_CSV_COLUMNS,
  formatAngka,
  formatRupiah,
  parsePebCsv,
} from '../engine/screening';
import {
  CsvValidationResult,
  PebRecord,
  RefBkRow,
  RuleCode,
  RuleConfig,
  ScreeningSummary,
} from '../types/tepat';

interface UnggahSaringPageProps {
  pebs: PebRecord[];
  dataSourceLabel: string;
  refRows: RefBkRow[];
  activeRules: RuleConfig;
  summary: ScreeningSummary;
  onUseSampleData: () => void;
  onApplyCsvData: (records: PebRecord[], fileName: string) => void;
  onUpdateRefRows: (rows: RefBkRow[]) => void;
  onResetRefRows: () => void;
  onToggleRule: (rule: RuleCode) => void;
  onRunScreening: () => void;
  onGoToDaftar: () => void;
}

interface FormattedNumericInputProps {
  value: number | null;
  isDecimal?: boolean;
  ariaLabel: string;
  className?: string;
  onChangeValue: (val: number | null) => void;
}

/** Input angka yang menampilkan format ribuan/desimal Indonesia saat tidak fokus */
function FormattedNumericInput({
  value,
  isDecimal = false,
  ariaLabel,
  className = '',
  onChangeValue,
}: FormattedNumericInputProps) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');

  const displayFormatted =
    value === null
      ? ''
      : isDecimal
        ? new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
            maximumFractionDigits: 2,
          }).format(value)
        : formatAngka(value);

  const handleFocus = () => {
    setFocused(true);
    setDraft(value === null ? '' : String(value).replace('.', ','));
  };

  const handleChange = (raw: string) => {
    setDraft(raw);
    const cleaned = raw.trim();
    if (cleaned === '') {
      onChangeValue(null);
      return;
    }
    const normalized = isDecimal
      ? cleaned.replace(/\./g, '').replace(',', '.')
      : cleaned.replace(/[^\d]/g, '');
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) {
      onChangeValue(parsed);
    }
  };

  const handleBlur = () => {
    setFocused(false);
  };

  return (
    <input
      type="text"
      inputMode={isDecimal ? 'decimal' : 'numeric'}
      value={focused ? draft : displayFormatted}
      onFocus={handleFocus}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      aria-label={ariaLabel}
      placeholder="Kosong"
      className={className}
    />
  );
}

export function UnggahSaringPage({
  pebs,
  dataSourceLabel,
  refRows,
  activeRules,
  summary,
  onUseSampleData,
  onApplyCsvData,
  onUpdateRefRows,
  onResetRefRows,
  onToggleRule,
  onRunScreening,
  onGoToDaftar,
}: UnggahSaringPageProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [csvStatus, setCsvStatus] = useState<CsvValidationResult | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [hasCompletedStep3, setHasCompletedStep3] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hitung sel kosong pada tabel Ref_BK untuk peringatan kuning
  const emptyCellIssues: string[] = [];
  refRows.forEach((row, index) => {
    if (!row.bulan.trim()) emptyCellIssues.push(`Baris ${index + 1}: kolom bulan kosong`);
    if (!row.komoditas.trim()) emptyCellIssues.push(`Baris ${index + 1}: kolom komoditas kosong`);
    if (!row.jenjang_harga.trim()) emptyCellIssues.push(`Baris ${index + 1}: jenjang harga referensi kosong`);
    if (row.tarif === null || Number.isNaN(row.tarif)) {
      emptyCellIssues.push(`Baris ${index + 1}: tarif kosong`);
    }
    if (row.hpe === null || Number.isNaN(row.hpe)) {
      emptyCellIssues.push(`Baris ${index + 1}: HPE kosong`);
    }
  });

  const handleFileSelected = async (file: File) => {
    const text = await file.text();
    const parsed = parsePebCsv(text);
    setCsvStatus(parsed);
    setUploadedFileName(file.name);
    if (parsed.valid) {
      onApplyCsvData(parsed.records, file.name);
      setHasCompletedStep3(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFileSelected(file);
  };

  const handleDownloadTemplate = () => {
    const sampleRows = [
      REQUIRED_CSV_COLUMNS.join(','),
      '002901,2026-11-23,Palma Dirga Perkasa,CPO,MINYAK SAWIT MENTAH (CPO) CURAH,1511.10.00,3200000000,210,7.5',
      '002902,2026-11-23,Kakao Samudra Sulawesi,Biji Kakao,BIJI KAKAO FERMENTASI KERING,1801.00.00,3800000000,50,10',
      '002903,2026-11-23,Sawit Rajawali Perkasa,RBD Palm Olein,CRUDE PALM OIL (CPO) IN FLEXIBAG,1511.90.37,2400000000,160,5',
    ].join('\n');
    const blob = new Blob([sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'templat_peb_tepat.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRefTextChange = (
    id: string,
    field: 'bulan' | 'komoditas' | 'pos_tarif' | 'jenjang_harga',
    rawValue: string
  ) => {
    const updated = refRows.map((row) =>
      row.id === id ? { ...row, [field]: rawValue } : row
    );
    onUpdateRefRows(updated);
  };

  const handleRefNumberChange = (
    id: string,
    field: 'tarif' | 'hpe',
    value: number | null
  ) => {
    const updated = refRows.map((row) =>
      row.id === id ? { ...row, [field]: value } : row
    );
    onUpdateRefRows(updated);
  };

  const handleAddRefRow = () => {
    const newRow: RefBkRow = {
      id: `ref-custom-${Date.now()}`,
      bulan: '2026-11',
      komoditas: '',
      pos_tarif: '1511.10.00',
      jenjang_harga: '',
      tarif: null,
      hpe: null,
    };
    onUpdateRefRows([newRow, ...refRows]);
  };

  const handleExecuteScreening = () => {
    onRunScreening();
    setHasCompletedStep3(true);
  };

  const activeRuleCount = Object.values(activeRules).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Stepper Tiga Langkah */}
      <nav
        aria-label="Tahapan unggah dan saring"
        className="grid grid-cols-1 gap-3 rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3"
      >
        {[
          { num: 1 as const, title: 'Unggah data PEB', desc: 'Berkas CSV atau data contoh' },
          { num: 2 as const, title: 'Periksa tabel rujukan', desc: 'Sunting Ref_BK bulan berjalan' },
          { num: 3 as const, title: 'Jalankan saringan', desc: 'Pilih aturan & mulai telaah H+1' },
        ].map((item) => {
          const isCurrent = step === item.num;
          const isPassed = step > item.num;
          return (
            <button
              key={item.num}
              type="button"
              onClick={() => setStep(item.num)}
              className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                isCurrent
                  ? 'border-[#1D4ED8] bg-[#EAF1FF]'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <span
                className={`tabular-angka inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isCurrent
                    ? 'bg-[#1D4ED8] text-white'
                    : isPassed
                      ? 'bg-[#FACC15] text-[#0F2A5C]'
                      : 'bg-slate-100 text-[#64748B]'
                }`}
              >
                {item.num}
              </span>
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-[#0F2A5C]">
                  {item.title}
                </div>
                <div className="truncate text-[11px] text-[#64748B]">
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* LANGKAH 1: Unggah Data PEB */}
      {step === 1 && (
        <section className="space-y-5 rounded-[12px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#0F2A5C]">
                1. Unggah Data PEB (H+1)
              </h2>
              <p className="mt-1 text-xs text-[#64748B]">
                Sumber data aktif saat ini:{' '}
                <span className="font-semibold text-[#0F172A]">
                  {dataSourceLabel}
                </span>{' '}
                (<span className="tabular-angka font-semibold">{formatAngka(pebs.length)}</span> baris terbaca)
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#0F2A5C] hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh templat CSV</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onUseSampleData();
                  setCsvStatus(null);
                  setUploadedFileName(null);
                  setHasCompletedStep3(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#EAF1FF] px-3 py-2 text-xs font-semibold text-[#1D4ED8] hover:bg-blue-100"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Gunakan data contoh (180 PEB)</span>
              </button>
            </div>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-blue-300 bg-[#EAF1FF]/45 px-6 py-10 text-center"
          >
            <Upload className="h-8 w-8 text-[#1D4ED8]" />
            <p className="mt-3 text-sm font-semibold text-[#0F2A5C]">
              Tarik dan lepas berkas CSV PEB di sini, atau pilih berkas
            </p>
            <p className="mt-1 text-xs text-[#64748B]">
              Semua pemrosesan CSV berjalan langsung di browser tanpa mengirim data ke server eksternal.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFileSelected(f);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E40AF]"
            >
              Pilih Berkas CSV
            </button>
          </div>

          {csvStatus && (
            <div
              className={`rounded-lg border p-4 text-xs ${
                csvStatus.valid
                  ? 'border-blue-200 bg-[#EAF1FF] text-[#0F2A5C]'
                  : 'border-[#FACC15] bg-[#FEF9C3] text-[#0F172A]'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {csvStatus.valid ? (
                  <CheckCircle2 className="h-4 w-4 text-[#1D4ED8]" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-[#0F2A5C]" />
                )}
                <span>
                  Berkas {uploadedFileName}:{' '}
                  <span className="tabular-angka">{formatAngka(csvStatus.rowsRead)}</span> baris valid terbaca
                </span>
              </div>
              {csvStatus.errors.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                  {csvStatus.errors.slice(0, 8).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {csvStatus.errors.length > 8 && (
                    <li>
                      Dan {csvStatus.errors.length - 8} galat baris lainnya.
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-xs font-bold text-[#0F2A5C]">
              Daftar Kolom Wajib CSV
            </h3>
            <div className="mt-2.5 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
              {REQUIRED_CSV_COLUMNS.map((col) => (
                <div
                  key={col}
                  className="rounded border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-[11px] text-[#0F172A]"
                >
                  {col}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E40AF]"
            >
              <span>Lanjut ke Tabel Rujukan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* LANGKAH 2: Periksa Tabel Rujukan Ref_BK */}
      {step === 2 && (
        <section className="space-y-4 rounded-[12px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-[#0F2A5C]">
                  2. Pratinjau & Sunting Tabel Rujukan Ref_BK
                </h2>
                <span className="rounded bg-[#FEF9C3] px-2 py-0.5 text-[11px] font-semibold text-[#0F2A5C] ring-1 ring-[#FACC15]">
                  CONTOH, ganti sesuai ketentuan bulan berjalan
                </span>
              </div>
              <p className="mt-1 text-xs text-[#64748B]">
                Klik langsung pada sel untuk menyunting nilai jenjang harga, tarif (%), atau HPE (Rp/MT).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAddRefRow}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#0F2A5C] hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah baris</span>
              </button>
              <button
                type="button"
                onClick={onResetRefRows}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#EAF1FF] px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] hover:bg-blue-100"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset nilai contoh</span>
              </button>
            </div>
          </div>

          {emptyCellIssues.length > 0 && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-[#FACC15] bg-[#FEF9C3] px-4 py-3 text-xs text-[#0F172A]"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#0F2A5C]" />
              <div>
                <p className="font-bold">
                  Peringatan: ditemukan {emptyCellIssues.length} sel kosong pada tabel Ref_BK
                </p>
                <p className="mt-0.5 text-[#0F172A]">
                  Lengkapi sel yang disorot kuning agar aturan R1 dan R2 dapat mengevaluasi PEB pada bulan tersebut ({emptyCellIssues.slice(0, 3).join('; ')}).
                </p>
              </div>
            </div>
          )}

          <div className="max-h-[420px] overflow-auto rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10 bg-[#EAF1FF] text-[#0F2A5C]">
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-2.5 font-semibold whitespace-nowrap">Bulan</th>
                  <th className="px-3 py-2.5 font-semibold">Komoditas</th>
                  <th className="px-3 py-2.5 font-semibold whitespace-nowrap">Pos Tarif</th>
                  <th className="px-3 py-2.5 font-semibold">Jenjang Harga Referensi</th>
                  <th className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">Tarif (%)</th>
                  <th className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">HPE (Rp/MT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {refRows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={idx % 2 === 1 ? 'bg-[#EAF1FF]/35' : 'bg-white'}
                  >
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        value={row.bulan}
                        onChange={(e) =>
                          handleRefTextChange(row.id, 'bulan', e.target.value)
                        }
                        aria-label={`Bulan baris ${idx + 1}`}
                        className={`tabular-angka w-24 rounded border px-2 py-1 text-xs ${
                          !row.bulan.trim()
                            ? 'border-[#FACC15] bg-[#FEF9C3]'
                            : 'border-slate-200 bg-white'
                        }`}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        value={row.komoditas}
                        onChange={(e) =>
                          handleRefTextChange(row.id, 'komoditas', e.target.value)
                        }
                        aria-label={`Komoditas baris ${idx + 1}`}
                        className={`w-36 rounded border px-2 py-1 text-xs ${
                          !row.komoditas.trim()
                            ? 'border-[#FACC15] bg-[#FEF9C3]'
                            : 'border-slate-200 bg-white'
                        }`}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        value={row.pos_tarif}
                        onChange={(e) =>
                          handleRefTextChange(row.id, 'pos_tarif', e.target.value)
                        }
                        aria-label={`Pos tarif baris ${idx + 1}`}
                        className="tabular-angka w-24 rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        value={row.jenjang_harga}
                        onChange={(e) =>
                          handleRefTextChange(row.id, 'jenjang_harga', e.target.value)
                        }
                        aria-label={`Jenjang harga baris ${idx + 1}`}
                        className={`w-full min-w-[200px] rounded border px-2 py-1 text-xs ${
                          !row.jenjang_harga.trim()
                            ? 'border-[#FACC15] bg-[#FEF9C3]'
                            : 'border-slate-200 bg-white'
                        }`}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <FormattedNumericInput
                        value={row.tarif}
                        isDecimal
                        ariaLabel={`Tarif baris ${idx + 1}`}
                        onChangeValue={(val) =>
                          handleRefNumberChange(row.id, 'tarif', val)
                        }
                        className={`tabular-angka w-20 rounded border px-2 py-1 text-right text-xs ${
                          row.tarif === null
                            ? 'border-[#FACC15] bg-[#FEF9C3]'
                            : 'border-slate-200 bg-white'
                        }`}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <FormattedNumericInput
                        value={row.hpe}
                        ariaLabel={`HPE baris ${idx + 1}`}
                        onChangeValue={(val) =>
                          handleRefNumberChange(row.id, 'hpe', val)
                        }
                        className={`tabular-angka w-32 rounded border px-2 py-1 text-right text-xs ${
                          row.hpe === null
                            ? 'border-[#FACC15] bg-[#FEF9C3]'
                            : 'border-slate-200 bg-white'
                        }`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#0F2A5C] hover:bg-slate-50"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E40AF]"
            >
              <span>Lanjut ke Jalankan Saringan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* LANGKAH 3: Ringkasan Sebelum Jalan & Jalankan Saringan H+1 */}
      {step === 3 && (
        <section className="space-y-5 rounded-[12px] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-[#0F2A5C]">
              3. Ringkasan Sebelum Saringan H+1
            </h2>
            <p className="mt-1 text-xs text-[#64748B]">
              Pastikan jumlah baris PEB terbaca dan sakelar aturan penyaringan sesuai sebelum eksekusi.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-[#EAF1FF] p-4">
              <p className="text-xs font-medium text-[#0F2A5C]">Baris PEB terbaca</p>
              <p className="tabular-angka mt-1 text-2xl font-bold text-[#0F2A5C]">
                {formatAngka(pebs.length)}
              </p>
              <p className="mt-0.5 text-[11px] text-[#64748B]">
                {dataSourceLabel}
              </p>
            </div>
            <div className="rounded-lg bg-[#EAF1FF] p-4">
              <p className="text-xs font-medium text-[#0F2A5C]">Aturan aktif</p>
              <p className="tabular-angka mt-1 text-2xl font-bold text-[#0F2A5C]">
                {activeRuleCount} dari 3
              </p>
              <p className="mt-0.5 text-[11px] text-[#64748B]">
                R1, R2, R3 dapat diubah di bawah
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-[#64748B]">Dampak pemuatan</p>
              <p className="tabular-angka mt-1 text-2xl font-bold text-[#0F2A5C]">
                0 tertunda
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-[#1D4ED8]">
                Target 0% · Hanya menandai H+1
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-[#0F2A5C]">
              Sakelar Aturan Penyaringan Aktif
            </h3>
            {(
              [
                {
                  code: 'R1' as const,
                  title: 'R1 — Tarif bulan',
                  desc: 'Membandingkan tarif_diberitahukan PEB terhadap tarif jenjang harga referensi bulan PEB di Ref_BK.',
                },
                {
                  code: 'R2' as const,
                  title: 'R2 — Harga dasar kakao',
                  desc: 'Menandai PEB komoditas kakao apabila nilai FOB per satuan (MT) lebih rendah dari HPE bulan PEB di Ref_BK.',
                },
                {
                  code: 'R3' as const,
                  title: 'R3 — Uraian terhadap pos',
                  desc: 'Mencocokkan kamus kata kunci presisi (misal CPO in flexibag pada pos olein 1511.90.37) tanpa menandai CPKO.',
                },
              ] as const
            ).map((rule) => {
              const checked = activeRules[rule.code];
              return (
                <label
                  key={rule.code}
                  className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50"
                >
                  <div>
                    <div className="text-xs font-bold text-[#0F2A5C]">
                      {rule.title}
                    </div>
                    <div className="mt-0.5 text-xs text-[#64748B]">
                      {rule.desc}
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    onClick={() => onToggleRule(rule.code)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      checked ? 'bg-[#1D4ED8]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        checked ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#0F2A5C] hover:bg-slate-50"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={handleExecuteScreening}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E40AF]"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Jalankan Saringan H+1</span>
            </button>
          </div>

          {hasCompletedStep3 && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-[#FACC15] bg-[#FEF9C3] p-4">
              <div>
                <p className="text-sm font-bold text-[#0F2A5C]">
                  Saringan H+1 selesai dijalankan
                </p>
                <p className="tabular-angka mt-0.5 text-xs text-[#0F172A]">
                  <span className="font-semibold">{formatAngka(summary.totalDisaring)}</span> PEB disaring ·{' '}
                  <span className="font-bold">{formatAngka(summary.totalBertanda)}</span> PEB bertanda ·{' '}
                  Potensi selisih <span className="font-semibold">{formatRupiah(summary.totalSelisih)}</span> ·{' '}
                  0 PEB tertunda pemuatan
                </p>
              </div>
              <button
                type="button"
                onClick={onGoToDaftar}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0F2A5C] px-4 py-2 text-xs font-semibold text-white hover:bg-[#163775]"
              >
                <span>Lihat Daftar Tanda</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
