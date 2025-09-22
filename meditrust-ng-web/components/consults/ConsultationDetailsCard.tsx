"use client";

type Props = {
  consult: any;
  statusBadge: (status: string) => string;
};

export default function ConsultationDetailsCard({
  consult,
  statusBadge,
}: Props) {
  if (!consult) return null;

  return (
    <div className="space-y-5 text-sm text-slate-700">
      {/* Doctor Info */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
        <p className="font-semibold text-slate-800">Doctor</p>
        <p>
          {consult.doctor} — {consult.specialty}
        </p>
      </div>

      {/* Symptoms */}
      <div>
        <p className="font-semibold text-slate-800 mb-1">Symptoms</p>
        <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-700">
          {consult.symptoms.join(", ")}
        </p>
      </div>

      {/* Status */}
      <div>
        <p className="font-semibold text-slate-800 mb-1">Status</p>
        <span className={statusBadge(consult.status)}>{consult.status}</span>
      </div>

      {/* Show ONLY if Verified */}
      {consult.status === "Verified" && (
        <>
          {/* Diagnosis */}
          <div>
            <p className="font-semibold text-slate-800 mb-1">Diagnosis</p>
            <p className="rounded-lg bg-slate-50 border border-slate-200 p-2">
              {consult.diagnosis}
            </p>
          </div>

          {/* Prescriptions */}
          <div>
            <p className="font-semibold text-slate-800 mb-1">Prescriptions</p>
            <ul className="space-y-2">
              {consult.prescriptions.map((p: string, i: number) => (
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
