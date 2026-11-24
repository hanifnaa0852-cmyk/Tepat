import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from 'lucide-react';
import {
  exportFlaggedToCsv,
  formatAngka,
  formatRpJuta,
  formatRupiah,
  formatTanggalId,
} from '../engine/screening';
import { FlaggedPeb, RuleCode, StatusTanda } from '../types/tepat';

interface DaftarTandaPageProps {
  flaggedList: FlaggedPeb[];
  initialRuleFilter: RuleCode | 'SEMUA';
  onRuleFilterChange: (rule: RuleCode | 'SEMUA') => void;
  onInspectPeb: (nomorPeb: string) => void;
}

const STATUS_OPTIONS: (StatusTanda | 'SEMUA')[] = [
  'SEMUA',
  'Baru',
  'Dalam klarifikasi',
  'Diusulkan ke Kanwil',
  'Ditetapkan',
  'Ditutup',
];

const PAGE_SIZE = 10;

export function DaftarTandaPage({
  flaggedList,
  initialRuleFilter,
  onRuleFilterChange,
  onInspectPeb,
}: DaftarTandaPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusTanda | 'SEMUA'>('SEMUA');
  const [sortOrder, setSortOrder] = useState<
    'selisih-desc' | 'selisih-asc' | 'tenggat-asc'
  >('selisih-desc');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = flaggedList.filter((item) => {
      if (initialRuleFilter !== 'SEMUA' && item.aturan !== initialRuleFilter) {
        return false;
      }
      if (statusFilter !== 'SEMUA' && item.status !== statusFilter) {
        return false;
      }
      if (q) {
        const matchPeb = item.peb.nomor_peb.toLowerCase().includes(q);
        const matchEx = item.peb.eksportir.toLowerCase().includes(q);
        if (!matchPeb && !matchEx) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortOrder === 'selisih-asc') {
        return a.perkiraanSelisih - b.perkiraanSelisih;
      }
      if (sortOrder === 'tenggat-asc') {
        const aScore = a.sisaHari >= 0 ? a.sisaHari : 10000 - a.sisaHari;
        const bScore = b.sisaHari >= 0 ? b.sisaHari : 10000 - b.sisaHari;
        return aScore - bScore;
      }
      return b.perkiraanSelisih - a.perkiraanSelisih;
    });
  }, [flaggedList, initialRuleFilter, statusFilter, searchQuery, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, initialRuleFilter, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const totalSelisihFiltered = filtered.reduce(
    (acc, item) => acc + item.perkiraanSelisih,
    0
  );

  const handleDownloadCsv = () => {
    const csv = exportFlaggedToCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tepat_daftar_tanda.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Bilah Pencarian & Filter */}
      <section className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-4">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor PEB atau eksportir..."
              aria-label="Cari nomor PEB atau eksportir"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:border-[#1D4ED8] focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={initialRuleFilter}
              onChange={(e) =>
                onRuleFilterChange(e.target.value as RuleCode | 'SEMUA')
              }
              aria-label="Filter aturan"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-[#0F172A] focus:border-[#1D4ED8] focus:outline-none"
            >
              <option value="SEMUA">Semua Aturan</option>
              <option value="R1">R1 · Tarif bulan</option>
              <option value="R2">R2 · Harga dasar kakao</option>
              <option value="R3">R3 · Uraian vs pos</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusTanda | 'SEMUA')
              }
              aria-label="Filter status"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-[#0F172A] focus:border-[#1D4ED8] focus:outline-none"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st === 'SEMUA' ? 'Semua Status' : st}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="relative">
              <ArrowDownUp className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(
                    e.target.value as 'selisih-desc' | 'selisih-asc' | 'tenggat-asc'
                  )
                }
                aria-label="Urutkan daftar tanda"
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-2 pl-8 text-xs font-medium text-[#0F172A] focus:border-[#1D4ED8] focus:outline-none"
              >
                <option value="selisih-desc">Selisih terbesar</option>
                <option value="selisih-asc">Selisih terkecil</option>
                <option value="tenggat-asc">Sisa hari terdekat</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end md:col-span-2">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1D4ED8] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E40AF]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tabel Daftar Tanda */}
      <section className="overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-[#EAF1FF] text-[#0F2A5C]">
                <th className="px-3.5 py-3 font-semibold whitespace-nowrap">Nomor PEB</th>
                <th className="px-3.5 py-3 font-semibold whitespace-nowrap">Tanggal</th>
                <th className="px-3.5 py-3 font-semibold">Eksportir</th>
                <th className="px-3.5 py-3 font-semibold">Komoditas</th>
                <th className="px-3.5 py-3 font-semibold">Aturan</th>
                <th className="px-3.5 py-3 font-semibold">Dugaan Kesalahan</th>
                <th className="px-3.5 py-3 text-right font-semibold whitespace-nowrap">
                  Perkiraan Selisih (Rp juta)
                </th>
                <th className="px-3.5 py-3 text-right font-semibold whitespace-nowrap">
                  Sisa Hari Penetapan
                </th>
                <th className="px-3.5 py-3 font-semibold">Prioritas</th>
                <th className="px-3.5 py-3 font-semibold">Status</th>
                <th className="px-3.5 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-10 text-center text-xs text-[#64748B]"
                  >
                    Tidak ada PEB bertanda yang sesuai dengan kriteria pencarian atau filter.
                  </td>
                </tr>
              ) : (
                pageItems.map((item, idx) => (
                  <tr
                    key={item.peb.nomor_peb}
                    className={idx % 2 === 1 ? 'bg-[#EAF1FF]/45' : 'bg-white'}
                  >
                    <td className="tabular-angka px-3.5 py-3 font-bold whitespace-nowrap text-[#0F2A5C]">
                      {item.peb.nomor_peb}
                    </td>
                    <td className="tabular-angka px-3.5 py-3 whitespace-nowrap text-[#64748B]">
                      {formatTanggalId(item.peb.tanggal_peb)}
                    </td>
                    <td className="px-3.5 py-3 font-medium text-[#0F172A]">
                      {item.peb.eksportir}
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap text-[#64748B]">
                      {item.peb.komoditas}
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="inline-block rounded bg-[#FACC15] px-2 py-0.5 font-bold text-[#0F2A5C]">
                        {item.aturan}
                      </span>
                    </td>
                    <td className="max-w-[260px] px-3.5 py-3 text-[#0F172A]">
                      <span className="line-clamp-2">{item.dugaanKesalahan}</span>
                    </td>
                    <td className="tabular-angka px-3.5 py-3 text-right font-semibold whitespace-nowrap text-[#0F2A5C]">
                      {formatRpJuta(item.perkiraanSelisih)}
                    </td>
                    <td className="tabular-angka px-3.5 py-3 text-right whitespace-nowrap">
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
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      {item.prioritas === 'Prioritas verifikasi' ? (
                        <span className="inline-block rounded bg-[#FEF9C3] px-2 py-0.5 text-[11px] font-bold text-[#0F2A5C] ring-1 ring-[#FACC15]">
                          Prioritas verifikasi
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-[#64748B]">
                          Reguler
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap text-[#0F172A]">
                      {item.status}
                    </td>
                    <td className="px-3.5 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onInspectPeb(item.peb.nomor_peb)}
                        className="rounded-lg bg-[#1D4ED8] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1E40AF]"
                      >
                        Tinjau
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-[#EAF1FF] font-bold text-[#0F2A5C]">
                <td colSpan={6} className="px-3.5 py-3 text-xs">
                  Total ({formatAngka(filtered.length)} PEB tersaring)
                </td>
                <td className="tabular-angka px-3.5 py-3 text-right text-xs whitespace-nowrap">
                  {formatRpJuta(totalSelisihFiltered)}
                </td>
                <td
                  colSpan={4}
                  className="tabular-angka px-3.5 py-3 text-right text-xs whitespace-nowrap text-[#64748B]"
                >
                  Nilai penuh: {formatRupiah(totalSelisihFiltered)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Paginasi */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-[#64748B]">
          <span className="tabular-angka">
            Menampilkan {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filtered.length)} dari {formatAngka(filtered.length)} tanda
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-[#0F2A5C] disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Sebelumnya</span>
            </button>
            <span className="tabular-angka px-2 font-semibold text-[#0F2A5C]">
              Halaman {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-[#0F2A5C] disabled:opacity-40"
            >
              <span>Berikutnya</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
