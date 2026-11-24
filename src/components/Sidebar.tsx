import React from 'react';
import {
  FileCheck2,
  FileSearch,
  LayoutDashboard,
  ListFilter,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { PageId } from '../types/tepat';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  openCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'ringkasan', label: 'Ringkasan', icon: LayoutDashboard },
  { id: 'unggah', label: 'Unggah dan Saring', icon: FileCheck2 },
  { id: 'daftar', label: 'Daftar Tanda', icon: ListFilter },
  { id: 'detail', label: 'Detail Tanda', icon: FileSearch },
  { id: 'aturan', label: 'Aturan dan Uji Balik', icon: SlidersHorizontal },
];

export function Sidebar({
  activePage,
  onNavigate,
  openCount,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const handleSelect = (page: PageId) => {
    onNavigate(page);
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[256px] shrink-0 flex-col bg-[#0F2A5C] text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/15 px-5 py-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#FACC15] text-sm font-bold text-[#0F2A5C]">
                TP
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                TEPAT
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-snug text-blue-100/80">
              Telaah Dini H+1 · Pandu Eksportir · Tuntas Satu Paket
            </p>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`group flex w-full items-center justify-between rounded-r-lg border-l-4 px-3.5 py-2.5 text-left text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'border-[#FACC15] bg-[#163775] text-white'
                    : 'border-transparent text-blue-100/85 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3 whitespace-nowrap">
                  <Icon className="h-4 w-4 shrink-0 text-white" />
                  <span>{item.label}</span>
                </span>
                {item.id === 'daftar' && (
                  <span className="tabular-angka ml-2 rounded-md bg-[#FACC15] px-2 py-0.5 text-xs font-semibold text-[#0F2A5C]">
                    {openCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/15 px-5 py-4 text-xs text-blue-100/80">
          <div className="font-semibold text-white">Prinsip Operasional</div>
          <p className="mt-1 leading-relaxed text-blue-100/75">
            Hanya menandai pasca-pemuatan (H+1). Tidak pernah menahan pemuatan barang ekspor.
          </p>
        </div>
      </aside>
    </>
  );
}
