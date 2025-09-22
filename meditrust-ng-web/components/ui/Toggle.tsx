'use client';
export default function Toggle({
  checked,
  onChange,
  label,
}: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2"
      aria-pressed={checked}
    >
      <span
        className={[
          'h-6 w-11 rounded-full p-0.5 transition',
          checked ? 'bg-teal-500' : 'bg-slate-300',
        ].join(' ')}
      >
        <span
          className={[
            'block h-5 w-5 rounded-full bg-white shadow-sm transition',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </span>
      {label && <span className="text-xs text-slate-600">{label}</span>}
    </button>
  );
}