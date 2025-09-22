"use client";

type Props = {
  consult: any;
};

export default function ConsultationSummaryCard({ consult }: Props) {
  if (!consult) return null;

  return (
    <div className="space-y-5 text-sm text-slate-700">
      {/* Doctor */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
        <p className="font-semibold text-slate-800">Doctor</p>
        <p>{consult.doctor} — {consult.specialty}</p>
      </div>

      {/* Patient */}
      <div>
        <p className="font-semibold text-slate-800 mb-1">Patient</p>
        <p>{consult.patientName}</p>
      </div>

      {/* Reason */}
      <div>
        <p className="font-semibold text-slate-800 mb-1">Reason</p>
        <p>{consult.reason}</p>
      </div>

      {/* Status */}
      <div>
        <p className="font-semibold text-slate-800 mb-1">Status</p>
        <span className="px-2 py-1 rounded-md bg-teal-100 text-teal-700 text-xs">
          {consult.status || "verified"}
        </span>
      </div>

      {/* Diagnosis & Prescriptions only if Verified */}
      {consult.status === "verified" && (
        <>
          <div>
            <p className="font-semibold text-slate-800 mb-1">Diagnosis</p>
            <p className="rounded-lg bg-slate-50 border border-slate-200 p-2">
              {consult.diagnosis}
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-800 mb-1">Prescriptions</p>
            <ul className="space-y-2">
              {consult.prescriptions?.map((p: string, i: number) => (
                <li
                  key={i}
                  className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-green-700"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Date & Time */}
      <div className="text-right text-xs text-slate-500">
        {consult.date}, {consult.time}
      </div>
    </div>
  );
}