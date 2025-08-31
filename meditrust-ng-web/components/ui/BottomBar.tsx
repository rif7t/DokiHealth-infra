'use client';
import Link from 'next/link';

export default function BottomBar({
  items,
}: {
  items: Array<{ key: string; label: string; icon: any; onClick?: () => void; href?: string; badge?: number }>;
}) {
  return (
    <nav className="fixed bottom-16 left-0 right-0 z-40 px-4">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white/95 backdrop-blur shadow-lg flex justify-around py-2">
        {items.map(({ key, label, icon: Icon, onClick, href, badge }) =>
          href ? (
            <Link key={key} href={href} className="relative flex flex-col items-center gap-1 px-3 py-1">
              <Icon className="h-5 w-5 text-teal-600" />
              {badge ? (
                <span className="absolute -top-1 right-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {badge}
                </span>
              ) : null}
              <span className="text-[11px] text-slate-600">{label}</span>
            </Link>
          ) : (
            <button key={key} onClick={onClick} className="relative flex flex-col items-center gap-1 px-3 py-1">
              <Icon className="h-5 w-5 text-teal-600" />
              {badge ? (
                <span className="absolute -top-1 right-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {badge}
                </span>
              ) : null}
              <span className="text-[11px] text-slate-600">{label}</span>
            </button>
          )
        )}
      </div>
    </nav>
  );
}