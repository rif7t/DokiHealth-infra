import { cn } from './cn';

export default function KPI({
  icon: Icon,
  value,
  label,
  className,
}: { icon: any; value: string; label: string; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-4 shadow-sm', className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-teal-600" />}
        <div className="ml-auto text-xs text-slate-500">{label}</div>
      </div>
      <div className="mt-2 text-lg font-bold text-slate-900">{value}</div>
    </div>
  );
}