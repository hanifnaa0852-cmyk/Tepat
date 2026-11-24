import { Calendar, Menu } from 'lucide-react';

interface HeaderProps {
  pageTitle: string;
  pageSubtitle: string;
  referenceDate: Date;
  onOpenMobileMenu: () => void;
}

export function Header({
  pageTitle,
  pageSubtitle,
  referenceDate,
  onOpenMobileMenu,
}: HeaderProps) {
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(referenceDate);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-3.5 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-lg border border-slate-200 p-2 text-[#0F2A5C] hover:bg-[#EAF1FF] lg:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
            <h1 className="truncate text-lg font-bold tracking-tight text-[#0F2A5C]">
              {pageTitle}
            </h1>
            <span className="hidden text-slate-300 sm:inline" aria-hidden="true">
              ·
            </span>
            <span className="hidden truncate text-xs font-medium text-[#64748B] sm:inline">
              {pageSubtitle}
            </span>
          </div>
          <p className="text-xs font-medium text-[#64748B]">
            KPPBC Tipe Madya Tanjung Aruna · PFPD Bea Keluar
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 rounded-lg bg-[#EAF1FF] px-3 py-1.5 text-xs font-medium text-[#0F2A5C]">
        <Calendar className="h-3.5 w-3.5 shrink-0 text-[#1D4ED8]" />
        <span className="whitespace-nowrap">{formattedDate}</span>
      </div>
    </header>
  );
}
