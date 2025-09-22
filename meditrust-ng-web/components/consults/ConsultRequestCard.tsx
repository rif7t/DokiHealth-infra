"use client";

type Props = {
  request: any;
  onAccept: () => void;
  onReject: () => void;
};

export default function ConsultRequestCard({ request, onAccept, onReject }: Props) {
  return (
    <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-1">
      <p className="font-medium text-slate-900">{request.patientName}</p>
      <p className="text-xs text-slate-500">{request.reason}</p>
      <div className="flex gap-2 pt-2">
        <button
          onClick={onAccept}
          className="flex-1 rounded-lg bg-teal-500 px-3 py-1 text-sm font-semibold text-white hover:bg-teal-600"
        >
          Accept
        </button>
        <button
          onClick={onReject}
          className="flex-1 rounded-lg bg-red-500 px-3 py-1 text-sm font-semibold text-white hover:bg-red-600"
        >
          Reject
        </button>
      </div>
    </div>
  );
}