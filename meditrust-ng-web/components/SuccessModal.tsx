'use client'
export default function SuccessModal({ show, onClose, message }: { show: boolean, onClose: () => void, message: string }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="card max-w-sm text-center space-y-4">
        <h2 className="text-xl font-semibold text-brand-cyan">✅ Success</h2>
        <p>{message}</p>
        <button onClick={onClose} className="btn-primary w-full">Continue</button>
      </div>
    </div>
  )
}
