'use client';
import Button from './ui/Button';

export default function SuccessModal({
  show,
  onClose,
  message,
}: { show: boolean; onClose: () => void; message: string }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl">
        <h2 className="text-lg font-semibold text-teal-600">✅ Success</h2>
        <p className="mt-2 text-sm text-slate-700">{message}</p>
        <Button onClick={onClose} className="mt-4 w-full">
          Continue
        </Button>
      </div>
    </div>
  );
}