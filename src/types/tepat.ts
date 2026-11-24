export type PageId =
  | 'ringkasan'
  | 'unggah'
  | 'daftar'
  | 'detail'
  | 'aturan';

export type RuleCode = 'R1' | 'R2' | 'R3';

export type StatusTanda =
  | 'Baru'
  | 'Dalam klarifikasi'
  | 'Diusulkan ke Kanwil'
  | 'Ditetapkan'
  | 'Ditutup';

export type DecisionOption =
  | 'Tetapkan dalam 30 hari'
  | 'Minta klarifikasi (selesai 3 hari kerja)'
  | 'Usulkan ke Kanwil (lewat 30 hari, dalam 10 hari kerja)'
  | 'Tutup (bukan temuan)';

export interface PebRecord {
  nomor_peb: string;
  tanggal_peb: string; // YYYY-MM-DD
  eksportir: string;
  komoditas: string;
  uraian_barang: string;
  pos_tarif: string;
  nilai_fob: number; // Rupiah
  jumlah: number; // Metrik Ton (MT)
  tarif_diberitahukan: number; // Persentase, misal 10 untuk 10%
  /** Label internal khusus data sintetis untuk validasi uji balik (TP/TN) */
  _label_uji_balik?: RuleCode | 'BERSIH';
}

export interface RefBkRow {
  id: string;
  bulan: string; // YYYY-MM
  komoditas: string;
  pos_tarif: string;
  jenjang_harga: string;
  tarif: number | null; // Persentase (%)
  hpe: number | null; // Rp per MT
}

export interface RuleConfig {
  R1: boolean;
  R2: boolean;
  R3: boolean;
}

export interface TimelineEvent {
  id: string;
  tahap: 'Ditandai sistem' | 'Diverifikasi' | 'Diputuskan' | 'Tanda palsu';
  waktu: string;
  oleh: string;
  keterangan: string;
}

export interface ComparisonField {
  label: string;
  nilaiPeb: string;
  nilaiRujukan: string;
  berbeda: boolean;
}

export interface FlaggedPeb {
  peb: PebRecord;
  aturan: RuleCode;
  dugaanKesalahan: string;
  perkiraanSelisih: number; // Rupiah
  sisaHari: number; // 30 - umur hari sejak tanggal_peb
  umurHari: number;
  prioritas: 'Prioritas verifikasi' | 'Reguler';
  status: StatusTanda;
  catatanPejabat: string;
  keputusanTerakhir?: DecisionOption;
  ditandaiPalsu: boolean;
  refMatched?: RefBkRow;
  perbandingan: ComparisonField[];
  riwayat: TimelineEvent[];
}

export interface DecisionState {
  status: StatusTanda;
  catatanPejabat: string;
  keputusanTerakhir?: DecisionOption;
  ditandaiPalsu: boolean;
  riwayat: TimelineEvent[];
}

export interface ScreeningSummary {
  totalDisaring: number;
  totalBertanda: number;
  totalSelisih: number;
  tertundaPemuatan: number; // Selalu 0 (target 0%)
  jumlahPerAturan: Record<RuleCode, number>;
  nilaiPerAturan: Record<RuleCode, number>;
  terakhirDijalankan: string;
}

export interface CsvValidationResult {
  valid: boolean;
  rowsRead: number;
  records: PebRecord[];
  errors: string[];
}

export interface ConfusionMatrix {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  total: number;
}

export interface BacktestMetrics {
  semua: ConfusionMatrix;
  periode2024_2025: ConfusionMatrix;
  periode2026: ConfusionMatrix;
  aturanNaifCrude: { tp: number; fp: number };
  aturanLonggarFlexibag: { tp: number; fp: number };
}

export interface FpFnLogRow {
  id: string;
  bulan: string;
  tanda: number;
  tandaPalsu: number;
  terlewat: number;
  aturanTerdampak: string;
  tindakanRevisi: string;
}
