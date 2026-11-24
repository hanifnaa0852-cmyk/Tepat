import { useMemo, useState } from 'react';
import { FooterNote } from './components/FooterNote';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import {
  DEFAULT_REFERENCE_DATE,
  INITIAL_DECISIONS,
  INITIAL_FP_FN_LOG,
  INITIAL_REF_BK,
  generateSyntheticPebs,
} from './data/mockData';
import {
  computeBacktestMetrics,
  formatRupiah,
  screenPebBatch,
} from './engine/screening';
import { AturanUjiBalikPage } from './pages/AturanUjiBalikPage';
import { DaftarTandaPage } from './pages/DaftarTandaPage';
import { DetailTandaPage } from './pages/DetailTandaPage';
import { RingkasanPage } from './pages/RingkasanPage';
import { UnggahSaringPage } from './pages/UnggahSaringPage';
import {
  DecisionOption,
  DecisionState,
  FpFnLogRow,
  PageId,
  PebRecord,
  RefBkRow,
  RuleCode,
  RuleConfig,
  StatusTanda,
} from './types/tepat';

const PAGE_HEADERS: Record<PageId, { title: string; subtitle: string }> = {
  ringkasan: {
    title: 'Ringkasan',
    subtitle: 'Ikhtisar penyaringan dini H+1 dan tenggat penetapan 30 hari',
  },
  unggah: {
    title: 'Unggah dan Saring',
    subtitle: 'Impor CSV PEB, sunting rujukan Ref_BK, dan jalankan penyaringan',
  },
  daftar: {
    title: 'Daftar Tanda',
    subtitle: 'Seluruh PEB bertanda berpotensi kurang bayar',
  },
  detail: {
    title: 'Detail Tanda',
    subtitle: 'Perbandingan data PEB dengan tabel rujukan dan keputusan PFPD',
  },
  aturan: {
    title: 'Aturan dan Uji Balik',
    subtitle: 'Konfigurasi aturan R1–R3, matriks kebingungan, dan log FP/FN',
  },
};

function decisionToStatus(decision: DecisionOption): StatusTanda {
  switch (decision) {
    case 'Tetapkan dalam 30 hari':
      return 'Ditetapkan';
    case 'Minta klarifikasi (selesai 3 hari kerja)':
      return 'Dalam klarifikasi';
    case 'Usulkan ke Kanwil (lewat 30 hari, dalam 10 hari kerja)':
      return 'Diusulkan ke Kanwil';
    case 'Tutup (bukan temuan)':
      return 'Ditutup';
  }
}

function getCurrentTimeLabel(): string {
  const now = new Date();
  const tgl = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(now);
  const jam = now.toTimeString().slice(0, 5);
  return `${tgl}, ${jam} WIB`;
}

export default function App() {
  const referenceDate = DEFAULT_REFERENCE_DATE;

  // Baseline sintetis tetap disimpan untuk tab Uji Balik meski pengguna mengunggah CSV baru
  const [syntheticPebs] = useState<PebRecord[]>(() => generateSyntheticPebs());
  const [pebs, setPebs] = useState<PebRecord[]>(() => syntheticPebs);
  const [dataSourceLabel, setDataSourceLabel] = useState<string>(
    'Data sintetis untuk demonstrasi (180 PEB)'
  );

  const [refRows, setRefRows] = useState<RefBkRow[]>(() => INITIAL_REF_BK);
  const [activeRules, setActiveRules] = useState<RuleConfig>({
    R1: true,
    R2: true,
    R3: true,
  });
  const [decisions, setDecisions] = useState<Record<string, DecisionState>>(
    () => INITIAL_DECISIONS
  );
  const [fpFnLog, setFpFnLog] = useState<FpFnLogRow[]>(() => INITIAL_FP_FN_LOG);

  const [activePage, setActivePage] = useState<PageId>('ringkasan');
  const [selectedPebNumber, setSelectedPebNumber] = useState<string | null>(
    '002385'
  );
  const [daftarRuleFilter, setDaftarRuleFilter] = useState<RuleCode | 'SEMUA'>(
    'SEMUA'
  );
  const [runTimestampLabel, setRunTimestampLabel] = useState<string>(
    '24 Nov 2026, 07:05 WIB'
  );
  const [justRanMessage, setJustRanMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Jalankan penyaringan secara deterministik dari state memori React
  const { flagged: flaggedList, summary } = useMemo(
    () =>
      screenPebBatch(
        pebs,
        refRows,
        activeRules,
        referenceDate,
        decisions,
        runTimestampLabel
      ),
    [pebs, refRows, activeRules, referenceDate, decisions, runTimestampLabel]
  );

  // Hitung uji balik nyata pada 180 PEB sintetis
  const backtest = useMemo(
    () => computeBacktestMetrics(syntheticPebs, refRows, activeRules),
    [syntheticPebs, refRows, activeRules]
  );

  const openFlaggedCount = useMemo(
    () =>
      flaggedList.filter(
        (item) => item.status !== 'Ditetapkan' && item.status !== 'Ditutup'
      ).length,
    [flaggedList]
  );

  const handleRunScreeningToday = () => {
    const ts = getCurrentTimeLabel();
    setRunTimestampLabel(ts);
    setJustRanMessage(
      `Saringan selesai (${ts}): ${summary.totalDisaring} PEB disaring, ${summary.totalBertanda} PEB bertanda (${formatRupiah(summary.totalSelisih)}), 0 PEB tertunda pemuatan.`
    );
  };

  const handleInspectPeb = (nomorPeb: string) => {
    setSelectedPebNumber(nomorPeb);
    setActivePage('detail');
  };

  const handleFilterByRule = (rule: RuleCode) => {
    setDaftarRuleFilter(rule);
    setActivePage('daftar');
  };

  const handleToggleRule = (rule: RuleCode) => {
    setActiveRules((prev) => ({
      ...prev,
      [rule]: !prev[rule],
    }));
  };

  const handleUseSampleData = () => {
    setPebs(syntheticPebs);
    setDataSourceLabel('Data sintetis untuk demonstrasi (180 PEB)');
    setRunTimestampLabel(getCurrentTimeLabel());
  };

  const handleApplyCsvData = (records: PebRecord[], fileName: string) => {
    setPebs(records);
    setDataSourceLabel(`Berkas CSV: ${fileName}`);
    setRunTimestampLabel(getCurrentTimeLabel());
  };

  const handleSaveDecision = (
    nomorPeb: string,
    decision: DecisionOption,
    notes: string
  ) => {
    const targetItem = flaggedList.find((f) => f.peb.nomor_peb === nomorPeb);
    if (!targetItem) return;

    const nextStatus = decisionToStatus(decision);
    const waktu = getCurrentTimeLabel();

    setDecisions((prev) => {
      const current = prev[nomorPeb];
      const baseHistory = current?.riwayat ?? targetItem.riwayat;
      const hasVerified = baseHistory.some((ev) => ev.tahap === 'Diverifikasi');
      const nextHistory = [
        ...baseHistory,
        ...(hasVerified
          ? []
          : [
              {
                id: `ver-${nomorPeb}-${Date.now()}`,
                tahap: 'Diverifikasi' as const,
                waktu,
                oleh: 'PFPD Bea Keluar',
                keterangan: 'Pemeriksaan dokumen PEB dan tabel Ref_BK selesai.',
              },
            ]),
        {
          id: `dec-${nomorPeb}-${Date.now() + 1}`,
          tahap: 'Diputuskan' as const,
          waktu,
          oleh: 'PFPD Bea Keluar',
          keterangan: `${decision}${notes.trim() ? ` — Catatan: ${notes.trim()}` : ''}`,
        },
      ];

      return {
        ...prev,
        [nomorPeb]: {
          status: nextStatus,
          keputusanTerakhir: decision,
          catatanPejabat: notes,
          ditandaiPalsu: current?.ditandaiPalsu ?? false,
          riwayat: nextHistory,
        },
      };
    });
  };

  const handleMarkFalsePositive = (nomorPeb: string, notes: string) => {
    const targetItem = flaggedList.find((f) => f.peb.nomor_peb === nomorPeb);
    if (!targetItem) return;

    const waktu = getCurrentTimeLabel();
    const bulanPeb = targetItem.peb.tanggal_peb.slice(0, 7);

    setDecisions((prev) => {
      const current = prev[nomorPeb];
      const baseHistory = current?.riwayat ?? targetItem.riwayat;
      return {
        ...prev,
        [nomorPeb]: {
          status: 'Ditutup',
          keputusanTerakhir: 'Tutup (bukan temuan)',
          catatanPejabat:
            notes.trim() ||
            'Ditandai sebagai tanda palsu (FP) untuk penyempurnaan kamus/tabel.',
          ditandaiPalsu: true,
          riwayat: [
            ...baseHistory,
            {
              id: `fp-${nomorPeb}-${Date.now()}`,
              tahap: 'Tanda palsu',
              waktu,
              oleh: 'PFPD Bea Keluar',
              keterangan: `Ditandai sebagai tanda palsu (${targetItem.aturan})${notes.trim() ? `: ${notes.trim()}` : ''}`,
            },
          ],
        },
      };
    });

    // Catat ke log FP/FN bulanan (hanya jika belum ditandai sebelumnya)
    if (!targetItem.ditandaiPalsu) {
      setFpFnLog((prev) => {
        const existingIdx = prev.findIndex((row) => row.bulan === bulanPeb);
        const revisiText = notes.trim()
          ? `PEB ${nomorPeb}: ${notes.trim()}`
          : `Evaluasi ulang kamus/parameter ${targetItem.aturan} untuk PEB ${nomorPeb}.`;

        if (existingIdx >= 0) {
          return prev.map((row, idx) =>
            idx === existingIdx
              ? {
                  ...row,
                  tandaPalsu: row.tandaPalsu + 1,
                  aturanTerdampak: row.aturanTerdampak.includes(targetItem.aturan)
                    ? row.aturanTerdampak
                    : `${row.aturanTerdampak}, ${targetItem.aturan}`,
                  tindakanRevisi: revisiText,
                }
              : row
          );
        }

        return [
          ...prev,
          {
            id: `log-${bulanPeb}-${Date.now()}`,
            bulan: bulanPeb,
            tanda: summary.totalBertanda,
            tandaPalsu: 1,
            terlewat: 0,
            aturanTerdampak: targetItem.aturan,
            tindakanRevisi: revisiText,
          },
        ];
      });
    }
  };

  const currentHeader = PAGE_HEADERS[activePage];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          setJustRanMessage(null);
        }}
        openCount={openFlaggedCount}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          pageTitle={currentHeader.title}
          pageSubtitle={currentHeader.subtitle}
          referenceDate={referenceDate}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="mx-auto flex w-full max-w-[1360px] flex-1 flex-col justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div>
            {activePage === 'ringkasan' && (
              <RingkasanPage
                summary={summary}
                flaggedList={flaggedList}
                onRunScreeningToday={handleRunScreeningToday}
                onInspectPeb={handleInspectPeb}
                onFilterByRule={handleFilterByRule}
                onGoToDaftar={() => setActivePage('daftar')}
                justRanMessage={justRanMessage}
              />
            )}

            {activePage === 'unggah' && (
              <UnggahSaringPage
                pebs={pebs}
                dataSourceLabel={dataSourceLabel}
                refRows={refRows}
                activeRules={activeRules}
                summary={summary}
                onUseSampleData={handleUseSampleData}
                onApplyCsvData={handleApplyCsvData}
                onUpdateRefRows={setRefRows}
                onResetRefRows={() => setRefRows(INITIAL_REF_BK)}
                onToggleRule={handleToggleRule}
                onRunScreening={() => setRunTimestampLabel(getCurrentTimeLabel())}
                onGoToDaftar={() => setActivePage('daftar')}
              />
            )}

            {activePage === 'daftar' && (
              <DaftarTandaPage
                flaggedList={flaggedList}
                initialRuleFilter={daftarRuleFilter}
                onRuleFilterChange={setDaftarRuleFilter}
                onInspectPeb={handleInspectPeb}
              />
            )}

            {activePage === 'detail' && (
              <DetailTandaPage
                flaggedList={flaggedList}
                selectedPebNumber={selectedPebNumber}
                onSelectPeb={(num) => setSelectedPebNumber(num)}
                onBackToList={() => setActivePage('daftar')}
                onSaveDecision={handleSaveDecision}
                onMarkFalsePositive={handleMarkFalsePositive}
              />
            )}

            {activePage === 'aturan' && (
              <AturanUjiBalikPage
                activeRules={activeRules}
                summary={summary}
                backtest={backtest}
                fpFnLog={fpFnLog}
                onToggleRule={handleToggleRule}
              />
            )}
          </div>

          <FooterNote />
        </main>
      </div>
    </div>
  );
}
