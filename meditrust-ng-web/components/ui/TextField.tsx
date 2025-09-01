'use client';
import { forwardRef } from 'react';
import { cn } from './cn';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, hint, icon: Icon, className, ...props }, ref) => (
    <label className="block">
      {label && <div className="mb-1 text-xs font-medium text-slate-700">{label}</div>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
            Icon && 'pl-9',
            className
          )}
          {...props}
        />
      </div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </label>
  )
);
TextField.displayName = 'TextField';
export default TextField;