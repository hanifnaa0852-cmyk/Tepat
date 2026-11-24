import { useState } from 'react';
import { formatAngka, formatPersen, formatRupiah } from '../engine/screening';
import {
  BacktestMetrics,
  FpFnLogRow,
  RuleCode,
  RuleConfig,
  ScreeningSummary,
} from '../types/tepat';

interface AturanUjiBalikPageProps {
  activeRules: RuleConfig;
  summary: ScreeningSummary;
  backtest: BacktestMetrics;
  fpFnLog: FpFnLogRow[];
  onToggleRule: (rule: RuleCode) => void;
}

const RULE_DETAILS: {
  code: RuleCode;
  title: string;
  question: string;
  inputs: string;
}[] = [
  {
    code: 'R1',
    title: 'R1 — Tarif bulan',
    question:
      'Apakah tarif bea keluar yang diberitahukan pada PEB sama dengan tarif pada jenjang harga referensi bulan PEB di tabel Ref_BK?',
    inputs:
      'tanggal_peb (bulan), komoditas / pos_tarif, tarif_diberitahukan, nilai_fob, dan tabel Ref_BK.',
  },
  {
    code: 'R2',
    title: 'R2 — Harga dasar kakao',
    question:
      'Untuk komoditas kakao, apakah nilai FOB per satuan (Rp/MT) pada PEB lebih rendah daripada HPE bulan PEB di tabel Ref_BK?',
    inputs:
      'tanggal_peb (bulan), komoditas kakao (pos 18xx), nilai_fob, jumlah (MT), dan HPE pada Ref_BK.',
  },
  {
    code: 'R3',
    title: 'R3 — Uraian terhadap pos',
    question:
      'Apakah uraian barang memuat kata kunci komoditas yang tidak sesuai dengan pos tarif yang diberitahukan (misal CPO dalam flexibag pada pos olein 1511.90.37)?',
    inputs:
      'uraian_barang, pos_tarif, kamus kata kunci presisi (mengecualikan CPKO / minyak kelapa), dan tarif Ref_BK.',
  },
];

export function AturanUjiBalikPage({
  activeRules,
  summary,
  backtest,
  fpFnLog,
  onToggleRule,
}: AturanUjiBalikPageProps) {
  const [activeTab, setActiveTab] = useState<'aturan' | 'ujibalik' | 'log'>(
    'aturan'
  );

  const {
    semua,
    periode2024_2025,
    periode2026,
    aturanNaifCrude,
    aturanLonggarFlexibag,
  } = backtest;

  const akurasiNilai =
    semua.total > 0 ? ((semua.tp + semua.tn) / semua.total) * 100 : 0;
  const presisiNilai =
    semua.tp + semua.fp > 0 ? (semua.tp / (semua.tp + semua.fp)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Navigasi Tiga Tab */}
      <div
        role="tablist"
        aria-label="Sub-halaman Aturan dan Uji Balik"
        className="inline-flex flex-wrap gap-1 rounded-[12px] border border-slate-200 bg-white p-1.5 shadow-sm"
      >
        {[
          { id: 'aturan' as const, label: 'Aturan R1–R3' },
          { id: 'ujibalik' as const, label: 'Uji Balik (Backtest)' },
          { id: 'log' as const, label: 'Log FP/FN Bulanan' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#1D4ED8] text-white'
                  : 'text-[#0F2A5C] hover:bg-[#EAF1FF]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB (a): ATURAN R1-R3 */}
      {activeTab === 'aturan' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {RULE_DETAILS.map((rule) => {
            const isEnabled = activeRules[rule.code];
            const count = summary.jumlahPerAturan[rule.code];
            const value = summary.nilaiPerAturan[rule.code];
            return (
              <article
                key={rule.code}
                className="flex flex-col justify-between rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded bg-[#FACC15] px-2.5 py-1 text-xs font-bold text-[#0F2A5C]">
                      {rule.code}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isEnabled}
                      aria-label={`Aktifkan ${rule.title}`}
                      onClick={() => onToggleRule(rule.code)}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                        isEnabled ? 'bg-[#1D4ED8]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-[#0F2A5C]">
                    {rule.title}
                  </h3>

                  <div className="mt-3 space-y-3 text-xs">
                    <div>
                      <p className="font-semibold text-[#64748B]">
                        Pertanyaan yang diuji
                      </p>
                      <p className="mt-1 leading-relaxed text-[#0F172A]">
                        {rule.question}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#64748B]">Data masukan</p>
                      <p className="mt-1 leading-relaxed text-[#0F172A]">
                        {rule.inputs}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-lg bg-[#EAF1FF] p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#0F2A5C]">Jumlah tanda</span>
                    <span className="tabular-angka text-right font-bold text-[#0F2A5C]">
                      {formatAngka(count)} PEB
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-[#0F2A5C]">Nilai selisih</span>
                    <span className="tabular-angka text-right font-bold whitespace-nowrap text-[#1D4ED8]">
                      {formatRupiah(value)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* TAB (b): UJI BALIK */}
      {activeTab === 'ujibalik' && (
        <div className="space-y-5">
          {/* Matriks Kebingungan 2x2 + Ringkasan Akurasi */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <section className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm lg:col-span-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-[#0F2A5C]">
                  Matriks Kebingungan 2×2 (Data Contoh n = {formatAngka(semua.total)})
                </h3>
                <span className="tabular-angka rounded bg-[#EAF1FF] px-2.5 py-1 text-xs font-bold whitespace-nowrap text-[#1D4ED8]">
                  Akurasi {formatPersen(akurasiNilai, 1)} · Presisi {formatPersen(presisiNilai, 1)}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#64748B]">
                Dihitung langsung dari eksekusi fungsi aturan R1–R3 pada 180 PEB sintetis.
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-center text-xs">
                  <thead>
                    <tr>
                      <th className="p-2" />
                      <th className="border border-slate-200 bg-[#EAF1FF] p-2.5 font-bold text-[#0F2A5C]">
                        Aktual Salah (Positif)
                      </th>
                      <th className="border border-slate-200 bg-[#EAF1FF] p-2.5 font-bold text-[#0F2A5C]">
                        Aktual Benar (Negatif)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th className="border border-slate-200 bg-[#EAF1FF] p-2.5 text-left font-bold text-[#0F2A5C]">
                        Ditandai Sistem
                      </th>
                      <td className="border border-slate-200 bg-[#FEF9C3] p-4">
                        <div className="tabular-angka text-2xl font-bold text-[#0F2A5C]">
                          {formatAngka(semua.tp)}
                        </div>
                        <div className="mt-0.5 text-[11px] font-semibold text-[#0F2A5C]">
                          True Positive (TP)
                        </div>
                      </td>
                      <td className="border border-slate-200 bg-white p-4">
                        <div className="tabular-angka text-2xl font-bold text-[#0F2A5C]">
                          {formatAngka(semua.fp)}
                        </div>
                        <div className="mt-0.5 text-[11px] font-medium text-[#64748B]">
                          False Positive (FP)
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-slate-200 bg-[#EAF1FF] p-2.5 text-left font-bold text-[#0F2A5C]">
                        Lolos (Bersih)
                      </th>
                      <td className="border border-slate-200 bg-white p-4">
                        <div className="tabular-angka text-2xl font-bold text-[#0F2A5C]">
                          {formatAngka(semua.fn)}
                        </div>
                        <div className="mt-0.5 text-[11px] font-medium text-[#64748B]">
                          False Negative (FN)
                        </div>
                      </td>
                      <td className="border border-slate-200 bg-[#EAF1FF]/45 p-4">
                        <div className="tabular-angka text-2xl font-bold text-[#0F2A5C]">
                          {formatAngka(semua.tn)}
                        </div>
                        <div className="mt-0.5 text-[11px] font-semibold text-[#0F2A5C]">
                          True Negative (TN)
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Tabel Per Periode */}
            <section className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm lg:col-span-6">
              <h3 className="text-sm font-bold text-[#0F2A5C]">
                Hasil Uji Balik per Periode
              </h3>
              <p className="mt-1 text-xs text-[#64748B]">
                Konsistensi deteksi pada periode historis 2024–2025 dan periode berjalan 2026.
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#EAF1FF] text-[#0F2A5C]">
                      <th className="px-3 py-2.5 font-semibold">Periode</th>
                      <th className="px-3 py-2.5 text-right font-semibold">n</th>
                      <th className="px-3 py-2.5 text-right font-semibold">TP</th>
                      <th className="px-3 py-2.5 text-right font-semibold">FP</th>
                      <th className="px-3 py-2.5 text-right font-semibold">FN</th>
                      <th className="px-3 py-2.5 text-right font-semibold">TN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { label: 'Seluruh 180 PEB', m: semua },
                      { label: 'PEB 2024–2025', m: periode2024_2025 },
                      { label: 'PEB 2026', m: periode2026 },
                    ].map((row, idx) => (
                      <tr
                        key={row.label}
                        className={idx % 2 === 1 ? 'bg-[#EAF1FF]/45' : 'bg-white'}
                      >
                        <td className="px-3 py-3 font-semibold text-[#0F2A5C]">
                          {row.label}
                        </td>
                        <td className="tabular-angka px-3 py-3 text-right font-medium text-[#64748B]">
                          {formatAngka(row.m.total)}
                        </td>
                        <td className="tabular-angka px-3 py-3 text-right font-bold text-[#0F2A5C]">
                          {formatAngka(row.m.tp)}
                        </td>
                        <td className="tabular-angka px-3 py-3 text-right font-medium text-[#0F172A]">
                          {formatAngka(row.m.fp)}
                        </td>
                        <td className="tabular-angka px-3 py-3 text-right font-medium text-[#0F172A]">
                          {formatAngka(row.m.fn)}
                        </td>
                        <td className="tabular-angka px-3 py-3 text-right font-semibold text-[#0F2A5C]">
                          {formatAngka(row.m.tn)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Kartu Pembanding Aturan Naif & Aturan Longgar + Bar Cakupan */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="rounded-[12px] border border-[#FACC15] bg-[#FEF9C3] p-5 shadow-sm lg:col-span-4">
              <p className="text-xs font-semibold text-[#0F2A5C]">
                Pembanding 1 · Aturan naif
              </p>
              <h4 className="mt-1 text-base font-bold text-[#0F2A5C]">
                Aturan naif memuat CRUDE
              </h4>
              <p className="tabular-angka mt-3 text-2xl font-bold text-[#0F2A5C]">
                {formatAngka(aturanNaifCrude.tp)} TP, {formatAngka(aturanNaifCrude.fp)} FP
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#0F172A]">
                Menandai CPKO (1513.21.10) dan Crude Coconut Oil (1513.11.00) yang sudah benar karena sekadar mencari kata "CRUDE".
              </p>
            </div>

            <div className="rounded-[12px] border border-[#FACC15] bg-[#FEF9C3] p-5 shadow-sm lg:col-span-4">
              <p className="text-xs font-semibold text-[#0F2A5C]">
                Pembanding 2 · Aturan longgar
              </p>
              <h4 className="mt-1 text-base font-bold text-[#0F2A5C]">
                Aturan longgar semua flexibag
              </h4>
              <p className="tabular-angka mt-3 text-2xl font-bold text-[#0F2A5C]">
                {formatAngka(aturanLonggarFlexibag.tp)} benar, {formatAngka(aturanLonggarFlexibag.fp)} FP
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#0F172A]">
                Menimbulkan banyak tanda palsu pada pengiriman RBD Palm Olein dan Stearin yang sah memakai kemasan flexibag.
              </p>
            </div>

            <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4">
              <p className="text-xs font-semibold text-[#64748B]">
                Perbandingan Cakupan Kasus Salah
              </p>
              <h4 className="mt-1 text-sm font-bold text-[#0F2A5C]">
                TEPAT {formatAngka(semua.tp)} dari 23 vs pola sekarang paling banyak 12 dari 23
              </h4>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#0F2A5C]">
                    <span>TEPAT (R1–R3 presisi)</span>
                    <span className="tabular-angka">{formatAngka(semua.tp)} / 23</span>
                  </div>
                  <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#1D4ED8]"
                      style={{ width: `${Math.round((semua.tp / 23) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-[#64748B]">
                    <span>Pola pemeriksaan sekarang (maks.)</span>
                    <span className="tabular-angka">12 / 23</span>
                  </div>
                  <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#FACC15]"
                      style={{ width: `${Math.round((12 / 23) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB (c): LOG FP/FN BULANAN */}
      {activeTab === 'log' && (
        <section className="space-y-4 rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F2A5C]">
                Log Tanda Palsu (FP) & Terlewat (FN) Bulanan
              </h3>
              <p className="mt-0.5 text-xs text-[#64748B]">
                Mencatat setiap revisi kamus uraian dan penyelarasan tabel Ref_BK dari umpan balik pejabat.
              </p>
            </div>
            <span className="rounded-lg bg-[#EAF1FF] px-3 py-1.5 text-xs font-semibold text-[#0F2A5C]">
              Validasi prospektif pilot triwulan I 2027
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#EAF1FF] text-[#0F2A5C]">
                  <th className="px-3.5 py-3 font-semibold whitespace-nowrap">Bulan</th>
                  <th className="px-3.5 py-3 text-right font-semibold whitespace-nowrap">Tanda</th>
                  <th className="px-3.5 py-3 text-right font-semibold whitespace-nowrap">Tanda Palsu (FP)</th>
                  <th className="px-3.5 py-3 text-right font-semibold whitespace-nowrap">Terlewat (FN)</th>
                  <th className="px-3.5 py-3 font-semibold">Aturan Terdampak</th>
                  <th className="px-3.5 py-3 font-semibold">Tindakan Revisi Kamus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fpFnLog.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={idx % 2 === 1 ? 'bg-[#EAF1FF]/45' : 'bg-white'}
                  >
                    <td className="tabular-angka px-3.5 py-3 font-semibold whitespace-nowrap text-[#0F2A5C]">
                      {row.bulan}
                    </td>
                    <td className="tabular-angka px-3.5 py-3 text-right font-medium text-[#0F172A]">
                      {formatAngka(row.tanda)}
                    </td>
                    <td className="tabular-angka px-3.5 py-3 text-right font-bold text-[#0F2A5C]">
                      {row.tandaPalsu > 0 ? (
                        <span className="rounded bg-[#FEF9C3] px-2 py-0.5 ring-1 ring-[#FACC15]">
                          {formatAngka(row.tandaPalsu)}
                        </span>
                      ) : (
                        formatAngka(row.tandaPalsu)
                      )}
                    </td>
                    <td className="tabular-angka px-3.5 py-3 text-right font-medium text-[#0F172A]">
                      {formatAngka(row.terlewat)}
                    </td>
                    <td className="px-3.5 py-3 font-medium text-[#0F2A5C]">
                      {row.aturanTerdampak}
                    </td>
                    <td className="px-3.5 py-3 text-[#0F172A]">
                      {row.tindakanRevisi}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
