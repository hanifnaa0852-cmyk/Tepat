import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Flag,
} from 'lucide-react';
import {
  formatAngka,
  formatPersen,
  formatRupiah,
  formatTanggalId,
} from '../engine/screening';
import { DecisionOption, FlaggedPeb } from '../types/tepat';

interface DetailTandaPageProps {
  flaggedList: FlaggedPeb[];
  selectedPebNumber: string | null;
  onSelectPeb: (nomorPeb: string) => void;
  onBackToList: () => void;
  onSaveDecision: (
    nomorPeb: string,
    decision: DecisionOption,
    notes: string
  ) => void;
  onMarkFalsePositive: (nomorPeb: string, notes: string) => void;
}

const DECISION_OPTIONS: {
  value: DecisionOption;
  title: string;
  subtitle: string;
}[] = [
  {
    value: 'Tetapkan dalam 30 hari',
    title: 'Tetapkan dalam 30 hari',
    subtitle: 'Terbitkan SPBK kurang bayar sebelum batas 30 hari sejak tanggal PEB.',
  },
  {
    value: 'Minta klarifikasi (selesai 3 hari kerja)',
    title: 'Minta klarifikasi (selesai 3 hari kerja)',
    subtitle: 'Kirim permintaan dokumen pendukung (kontrak/invoice/COA) ke eksportir.',
  },
  {
    value: 'Usulkan ke Kanwil (lewat 30 hari, dalam 10 hari kerja)',
    title: 'Usulkan ke Kanwil (lewat 30 hari, dalam 10 hari kerja)',
    subtitle: 'Ajukan penetapan ke Kantor Wilayah karena umur PEB melewati 30 hari.',
  },
  {
    value: 'Tutup (bukan temuan)',
    title: 'Tutup (bukan temuan)',
    subtitle: 'Data pemberitahuan telah sesuai ketentuan setelah verifikasi dokumen.',
  },
];

export function DetailTandaPage({
  flaggedList,
  selectedPebNumber,
  onSelectPeb,
  onBackToList,
  onSaveDecision,
  onMarkFalsePositive,
}: DetailTandaPageProps) {
  const currentItem =
    flaggedList.find((item) => item.peb.nomor_peb === selectedPebNumber) ??
    flaggedList[0];

  const [selectedDecision, setSelectedDecision] = useState<DecisionOption>(
    currentItem?.keputusanTerakhir ?? 'Tetapkan dalam 30 hari'
  );
  const [notes, setNotes] = useState(currentItem?.catatanPejabat ?? '');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentItem) {
      setSelectedDecision(
        currentItem.keputusanTerakhir ?? 'Tetapkan dalam 30 hari'
      );
      setNotes(currentItem.catatanPejabat);
      setFeedbackMessage(null);
    }
  }, [currentItem?.peb.nomor_peb]);

  if (!currentItem) {
    return (
      <div className="rounded-[12px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-[#0F2A5C]">
          Belum ada PEB bertanda untuk ditinjau.
        </p>
        <button
          type="button"
          onClick={onBackToList}
          className="mt-4 rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white"
        >
          Kembali ke Daftar Tanda
        </button>
      </div>
    );
  }

  const { peb } = currentItem;
  const fobPerSatuan = peb.jumlah > 0 ? peb.nilai_fob / peb.jumlah : 0;

  const handleSave = () => {
    onSaveDecision(peb.nomor_peb, selectedDecision, notes);
    setFeedbackMessage(
      `Keputusan "${selectedDecision}" berhasil disimpan untuk PEB ${peb.nomor_peb}.`
    );
  };

  const handleMarkFp = () => {
    onMarkFalsePositive(peb.nomor_peb, notes);
    setFeedbackMessage(
      `PEB ${peb.nomor_peb} ditandai sebagai tanda palsu (FP) dan dicatat ke log FP bulanan.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Bilah Navigasi Atas Detail */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToList}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#0F2A5C] hover:bg-slate-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Daftar Tanda</span>
        </button>

        <div className="flex items-center gap-2">
          <label
            htmlFor="pilih-peb-detail"
            className="text-xs font-medium text-[#64748B]"
          >
            Pilih PEB bertanda:
          </label>
          <select
            id="pilih-peb-detail"
            value={peb.nomor_peb}
            onChange={(e) => onSelectPeb(e.target.value)}
            className="tabular-angka rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#0F2A5C] focus:border-[#1D4ED8] focus:outline-none"
          >
            {flaggedList.map((item) => (
              <option key={item.peb.nomor_peb} value={item.peb.nomor_peb}>
                PEB {item.peb.nomor_peb} · {item.aturan} · {item.peb.eksportir}
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedbackMessage && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-[12px] border border-blue-200 bg-[#EAF1FF] px-4 py-3 text-xs font-semibold text-[#0F2A5C]"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1D4ED8]" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Dua Kolom Utama */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* KOLOM KIRI: Data PEB + Perbandingan Berdampingan + Selisih & Sisa Waktu */}
        <div className="space-y-5 lg:col-span-7">
          <section className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="tabular-angka text-lg font-bold text-[#0F2A5C]">
                    PEB {peb.nomor_peb}
                  </h2>
                  <span className="rounded bg-[#FACC15] px-2 py-0.5 text-xs font-bold text-[#0F2A5C]">
                    {currentItem.aturan}
                  </span>
                  {currentItem.prioritas === 'Prioritas verifikasi' && (
                    <span className="rounded bg-[#FEF9C3] px-2 py-0.5 text-xs font-bold text-[#0F2A5C] ring-1 ring-[#FACC15]">
                      Prioritas verifikasi
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#64748B]">
                  {peb.eksportir} · Tanggal PEB {formatTanggalId(peb.tanggal_peb)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-medium text-[#64748B]">
                  Status saat ini
                </span>
                <p className="text-xs font-bold text-[#0F2A5C]">
                  {currentItem.status}
                </p>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-[#64748B]">Komoditas diberitahukan</dt>
                <dd className="mt-0.5 font-semibold text-[#0F172A]">
                  {peb.komoditas}
                </dd>
              </div>
              <div>
                <dt className="text-[#64748B]">Pos tarif (HS) & tarif PEB</dt>
                <dd className="tabular-angka mt-0.5 font-semibold text-[#0F172A]">
                  {peb.pos_tarif} · {formatPersen(peb.tarif_diberitahukan)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[#64748B]">Uraian barang</dt>
                <dd className="mt-0.5 rounded bg-slate-50 px-2.5 py-1.5 font-medium text-[#0F172A]">
                  {peb.uraian_barang}
                </dd>
              </div>
              <div>
                <dt className="text-[#64748B]">Nilai FOB</dt>
                <dd className="tabular-angka mt-0.5 font-semibold whitespace-nowrap text-[#0F172A]">
                  {formatRupiah(peb.nilai_fob)}
                </dd>
              </div>
              <div>
                <dt className="text-[#64748B]">Kuantitas & FOB per MT</dt>
                <dd className="tabular-angka mt-0.5 font-semibold whitespace-nowrap text-[#0F172A]">
                  {formatAngka(peb.jumlah)} MT ({formatRupiah(fobPerSatuan)}/MT)
                </dd>
              </div>
            </dl>
          </section>

          {/* Perbandingan Berdampingan Nilai PEB vs Tabel Rujukan Bulan PEB */}
          <section className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#0F2A5C]">
              Perbandingan Nilai PEB vs Tabel Rujukan ({peb.tanggal_peb.slice(0, 7)})
            </h3>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Perbedaan nilai antara pemberitahuan dan tabel rujukan Ref_BK/kamus disorot kuning.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#EAF1FF] text-[#0F2A5C]">
                    <th className="px-3 py-2.5 font-semibold">Parameter</th>
                    <th className="px-3 py-2.5 font-semibold">Nilai pada PEB</th>
                    <th className="px-3 py-2.5 font-semibold">Nilai Rujukan / Seharusnya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentItem.perbandingan.map((row) => (
                    <tr
                      key={row.label}
                      className={row.berbeda ? 'bg-[#FEF9C3]' : 'bg-white'}
                    >
                      <td className="px-3 py-2.5 font-medium text-[#0F172A]">
                        {row.label}
                      </td>
                      <td className="tabular-angka px-3 py-2.5 font-semibold text-[#0F172A]">
                        {row.nilaiPeb}
                      </td>
                      <td className="tabular-angka px-3 py-2.5 font-bold text-[#0F2A5C]">
                        {row.nilaiRujukan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[#FACC15] bg-[#FEF9C3] p-3.5">
                <p className="text-[11px] font-semibold text-[#0F2A5C]">
                  Perkiraan selisih bea keluar
                </p>
                <p className="tabular-angka mt-1 text-xl font-bold whitespace-nowrap text-[#0F2A5C]">
                  {formatRupiah(currentItem.perkiraanSelisih)}
                </p>
              </div>
              <div className="rounded-lg bg-[#EAF1FF] p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-[#0F2A5C]">
                    Sisa waktu batas 30 hari
                  </p>
                  <Clock className="h-3.5 w-3.5 text-[#1D4ED8]" />
                </div>
                <p className="tabular-angka mt-1 text-xl font-bold whitespace-nowrap text-[#0F2A5C]">
                  {currentItem.sisaHari >= 0
                    ? `${currentItem.sisaHari} hari lagi`
                    : `Lewat ${Math.abs(currentItem.sisaHari)} hari`}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* KOLOM KANAN: Kartu Radio Keputusan + Catatan + Simpan + Tanda Palsu */}
        <div className="lg:col-span-5">
          <section className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#0F2A5C]">
              Keputusan Pejabat (PFPD)
            </h3>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Pilih tindak lanjut penetapan atau klarifikasi untuk dokumen ini.
            </p>

            <div className="mt-4 space-y-2.5" role="radiogroup" aria-label="Pilihan keputusan">
              {DECISION_OPTIONS.map((opt) => {
                const isSelected = selectedDecision === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? 'border-[#1D4ED8] bg-[#EAF1FF]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="keputusan-pfpd"
                      value={opt.value}
                      checked={isSelected}
                      onChange={() => setSelectedDecision(opt.value)}
                      className="mt-0.5 h-4 w-4 accent-[#1D4ED8]"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#0F2A5C]">
                        {opt.title}
                      </div>
                      <div className="mt-0.5 text-[11px] leading-relaxed text-[#64748B]">
                        {opt.subtitle}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-4">
              <label
                htmlFor="catatan-pejabat"
                className="block text-xs font-semibold text-[#0F2A5C]"
              >
                Catatan pejabat
              </label>
              <textarea
                id="catatan-pejabat"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tuliskan dasar verifikasi, nomor referensi invoice/COA, atau alasan penetapan..."
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:border-[#1D4ED8] focus:outline-none"
              />
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleSave}
                className="w-full rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1E40AF]"
              >
                Simpan keputusan
              </button>
              <button
                type="button"
                onClick={handleMarkFp}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#0F2A5C] transition-colors hover:bg-[#FEF9C3]"
              >
                <Flag className="h-3.5 w-3.5" />
                <span>Tandai sebagai tanda palsu</span>
              </button>
            </div>

            {currentItem.ditandaiPalsu && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#FACC15] bg-[#FEF9C3] p-3 text-xs text-[#0F172A]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#0F2A5C]" />
                <span>
                  Dokumen ini sudah dicatat sebagai tanda palsu (FP) pada log FP/FN bulanan.
                </span>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Lini Masa Riwayat */}
      <section className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#0F2A5C]">
          Lini Masa Riwayat Penanganan
        </h3>
        <ol className="mt-4 space-y-4">
          {currentItem.riwayat.map((ev, idx) => (
            <li
              key={ev.id}
              className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3 last:border-none last:pb-0"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`tabular-angka mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    ev.tahap === 'Diputuskan'
                      ? 'bg-[#1D4ED8] text-white'
                      : ev.tahap === 'Tanda palsu'
                        ? 'bg-[#FACC15] text-[#0F2A5C]'
                        : 'bg-[#EAF1FF] text-[#0F2A5C]'
                  }`}
                >
                  {idx + 1}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-[#0F2A5C]">{ev.tahap}</span>
                    <span className="text-[#64748B]">·</span>
                    <span className="font-medium text-[#64748B]">{ev.oleh}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#0F172A]">{ev.keterangan}</p>
                </div>
              </div>
              <span className="tabular-angka text-[11px] font-medium whitespace-nowrap text-[#64748B]">
                {ev.waktu}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
