import {
  ArrowRight,
  Clock,
  Play,
  ShieldCheck,
} from 'lucide-react';
import {
  formatAngka,
  formatPersen,
  formatRpJuta,
  formatRupiah,
  formatTanggalId,
} from '../engine/screening';
import { FlaggedPeb, RuleCode, ScreeningSummary } from '../types/tepat';

interface RingkasanPageProps {
  summary: ScreeningSummary;
  flaggedList: FlaggedPeb[];
  onRunScreeningToday: () => void;
  onInspectPeb: (nomorPeb: string) => void;
  onFilterByRule: (rule: RuleCode) => void;
  onGoToDaftar: () => void;
  justRanMessage: string | null;
}

const RULE_LABELS: Record<RuleCode, { short: string; name: string }> = {
  R1: { short: 'R1', name: 'Tarif bulan (Ref_BK)' },
  R2: { short: 'R2', name: 'Harga dasar kakao (HPE)' },
  R3: { short: 'R3', name: 'Uraian terhadap pos tarif' },
};

export function RingkasanPage({
  summary,
  flaggedList,
  onRunScreeningToday,
  onInspectPeb,
  onFilterByRule,
  onGoToDaftar,
  justRanMessage,
}: RingkasanPageProps) {
  // Tiga PEB dengan sisa hari paling dekat dari batas 30 hari (masih terbuka & sisa >= 0)
  const tenggatTerdekat = [...flaggedList]
    .filter(
      (item) =>
        item.status !== 'Ditetapkan' &&
        item.status !== 'Ditutup' &&
        item.sisaHari >= 0
    )
    .sort((a, b) => a.sisaHari - b.sisaHari)
    .slice(0, 3);

  // Lima tanda prioritas dengan perkiraan selisih terbesar
  const limaPrioritas = [...flaggedList]
    .filter((item) => item.status !== 'Ditutup')
    .sort((a, b) => b.perkiraanSelisih - a.perkiraanSelisih)
    .slice(0, 5);

  const maxRuleCount = Math.max(
    1,
    summary.jumlahPerAturan.R1,
    summary.jumlahPerAturan.R2,
    summary.jumlahPerAturan.R3
  );

  const persentaseBertanda =
    summary.totalDisaring > 0
      ? (summary.totalBertanda / summary.totalDisaring) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Baris Aksi Utama */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-[#0F2A5C]">
            Penyaringan Dini H+1 Bea Keluar
          </h2>
          <p className="mt-0.5 text-xs text-[#64748B]">
            Terakhir dijalankan: {summary.terakhirDijalankan} · Sumber aktif: data sintetis untuk demonstrasi
          </p>
        </div>
        <button
          type="button"
          onClick={onRunScreeningToday}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1E40AF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>Jalankan Saringan Hari Ini</span>
        </button>
      </div>

      {justRanMessage && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#FACC15] bg-[#FEF9C3] px-4 py-3 text-xs font-medium text-[#0F172A]"
        >
          <span>{justRanMessage}</span>
          <button
            type="button"
            onClick={onGoToDaftar}
            className="inline-flex items-center gap-1 font-semibold text-[#0F2A5C] underline-offset-2 hover:underline"
          >
            <span>Buka Daftar Tanda</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Empat Kartu Statistik */}
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Statistik penyaringan"
      >
        <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-[#64748B]">PEB disaring</p>
          <p className="tabular-angka mt-2 text-3xl font-bold tracking-tight text-[#0F2A5C]">
            {formatAngka(summary.totalDisaring)}
          </p>
          <p className="mt-1.5 text-xs text-[#64748B]">
            Seluruh dokumen batch aktif H+1
          </p>
        </div>

        <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-[#64748B]">PEB bertanda</p>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="tabular-angka inline-block rounded-lg bg-[#FACC15] px-2.5 py-0.5 text-3xl font-bold tracking-tight text-[#0F2A5C]">
              {formatAngka(summary.totalBertanda)}
            </span>
            <span className="tabular-angka text-xs font-semibold text-[#64748B]">
              ({formatPersen(persentaseBertanda, 1)})
            </span>
          </div>
          <p className="mt-1.5 text-xs text-[#64748B]">
            Berpotensi kurang bayar untuk ditinjau
          </p>
        </div>

        <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-[#64748B]">
            Total potensi selisih bea keluar
          </p>
          <p className="tabular-angka mt-2 text-xl font-bold tracking-tight whitespace-nowrap text-[#0F2A5C] xl:text-[22px]">
            {formatRupiah(summary.totalSelisih)}
          </p>
          <p className="tabular-angka mt-1.5 text-xs text-[#64748B]">
            Setara Rp {formatRpJuta(summary.totalSelisih)} juta (R1–R3)
          </p>
        </div>

        <div className="rounded-[12px] border border-blue-200 bg-[#EAF1FF] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-[#0F2A5C]">
              PEB tertunda pemuatan
            </p>
            <ShieldCheck className="h-4 w-4 text-[#1D4ED8]" />
          </div>
          <p className="tabular-angka mt-2 text-3xl font-bold tracking-tight text-[#0F2A5C]">
            {summary.tertundaPemuatan}
          </p>
          <p className="mt-1.5 text-xs font-semibold text-[#1D4ED8]">
            target 0% · Tidak menahan pemuatan
          </p>
        </div>
      </section>

      {/* Grafik Batang Per Aturan + Tenggat Terdekat */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Grafik Batang Jumlah Tanda per Aturan */}
        <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F2A5C]">
                Jumlah Tanda per Aturan
              </h3>
              <p className="mt-0.5 text-xs text-[#64748B]">
                Klik batang aturan untuk menyaring Daftar Tanda
              </p>
            </div>
            <span className="tabular-angka text-xs font-semibold text-[#0F2A5C]">
              Total: {formatAngka(summary.totalBertanda)} tanda
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {(['R1', 'R2', 'R3'] as RuleCode[]).map((code) => {
              const count = summary.jumlahPerAturan[code];
              const value = summary.nilaiPerAturan[code];
              const pct = Math.round((count / maxRuleCount) * 100);
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => onFilterByRule(code)}
                  className="group block w-full rounded-lg p-2.5 text-left transition-colors hover:bg-[#EAF1FF]/70"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="inline-flex w-8 shrink-0 justify-center rounded bg-[#FACC15] px-1.5 py-0.5 font-bold text-[#0F2A5C]">
                        {RULE_LABELS[code].short}
                      </span>
                      <span className="truncate font-semibold text-[#0F172A] group-hover:text-[#1D4ED8]">
                        {RULE_LABELS[code].name}
                      </span>
                    </div>
                    <div className="tabular-angka flex shrink-0 items-center gap-4 text-right">
                      <span className="min-w-[132px] text-right text-[#64748B]">
                        {formatRupiah(value)}
                      </span>
                      <span className="min-w-[54px] text-right font-bold text-[#0F2A5C]">
                        {formatAngka(count)} PEB
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#1D4ED8] transition-all duration-300"
                      style={{ width: `${count === 0 ? 0 : Math.max(pct, 6)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kartu Tenggat Terdekat */}
        <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#0F2A5C]">
                Tenggat Terdekat
              </h3>
              <p className="mt-0.5 text-xs text-[#64748B]">
                Tiga PEB dengan sisa hari terkecil dari batas 30 hari
              </p>
            </div>
            <Clock className="h-4 w-4 text-[#1D4ED8]" />
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {tenggatTerdekat.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#64748B]">
                Tidak ada PEB aktif dalam jendela 30 hari.
              </p>
            ) : (
              tenggatTerdekat.map((item) => {
                const mendesak = item.sisaHari < 10;
                return (
                  <button
                    key={item.peb.nomor_peb}
                    type="button"
                    onClick={() => onInspectPeb(item.peb.nomor_peb)}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-[#EAF1FF]/50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="tabular-angka text-sm font-bold text-[#0F2A5C]">
                          PEB {item.peb.nomor_peb}
                        </span>
                        <span className="rounded bg-[#EAF1FF] px-1.5 py-0.5 text-[11px] font-semibold text-[#1D4ED8]">
                          {item.aturan}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[#64748B]">
                        {item.peb.eksportir} · {formatTanggalId(item.peb.tanggal_peb)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className={`tabular-angka inline-block rounded-md px-2.5 py-1 text-xs font-bold whitespace-nowrap ${
                          mendesak
                            ? 'bg-[#FACC15] text-[#0F2A5C]'
                            : 'bg-[#EAF1FF] text-[#0F2A5C]'
                        }`}
                      >
                        Sisa {item.sisaHari} hari
                      </span>
                      <p className="tabular-angka mt-1 text-xs font-semibold whitespace-nowrap text-[#0F172A]">
                        Rp {formatRpJuta(item.perkiraanSelisih)} jt
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Tabel Lima Tanda Prioritas */}
      <section className="rounded-[12px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-[#0F2A5C]">
              Lima Tanda Prioritas
            </h3>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Diurutkan berdasarkan perkiraan selisih bea keluar tertinggi
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToDaftar}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:text-[#0F2A5C]"
          >
            <span>Lihat semua tanda</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-[#EAF1FF] text-[#0F2A5C]">
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Nomor PEB</th>
                <th className="px-4 py-3 font-semibold">Eksportir</th>
                <th className="px-4 py-3 font-semibold">Komoditas</th>
                <th className="px-4 py-3 font-semibold">Aturan</th>
                <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                  Perkiraan Selisih (Rp)
                </th>
                <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                  Sisa Hari
                </th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {limaPrioritas.map((item, idx) => (
                <tr
                  key={item.peb.nomor_peb}
                  className={idx % 2 === 1 ? 'bg-[#EAF1FF]/45' : 'bg-white'}
                >
                  <td className="tabular-angka px-4 py-3 font-semibold whitespace-nowrap text-[#0F2A5C]">
                    {item.peb.nomor_peb}
                  </td>
                  <td className="px-4 py-3 text-[#0F172A]">
                    {item.peb.eksportir}
                  </td>
                  <td className="px-4 py-3 text-[#64748B] whitespace-nowrap">
                    {item.peb.komoditas}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded bg-[#FACC15] px-2 py-0.5 font-bold text-[#0F2A5C]">
                      {item.aturan}
                    </span>
                  </td>
                  <td className="tabular-angka px-4 py-3 text-right font-semibold whitespace-nowrap text-[#0F172A]">
                    {formatRupiah(item.perkiraanSelisih)}
                  </td>
                  <td className="tabular-angka px-4 py-3 text-right whitespace-nowrap">
                    {item.sisaHari < 0 ? (
                      <span className="text-[#64748B]">Lewat 30 hari</span>
                    ) : (
                      <span
                        className={`inline-block rounded px-2 py-0.5 font-semibold ${
                          item.sisaHari < 10
                            ? 'bg-[#FEF9C3] text-[#0F2A5C] ring-1 ring-[#FACC15]'
                            : 'text-[#0F172A]'
                        }`}
                      >
                        {item.sisaHari} hari
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-[#0F172A]">
                    {item.status}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onInspectPeb(item.peb.nomor_peb)}
                      className="rounded-lg bg-[#1D4ED8] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1E40AF]"
                    >
                      Tinjau
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
