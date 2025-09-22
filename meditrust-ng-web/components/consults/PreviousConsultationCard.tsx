"use client";
import { Card, CardContent } from "@/components/ui/Card";

type Props = {
  consult: any;
  onClick: () => void;
};

export default function PreviousConsultationCard({ consult, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-slate-200 bg-blue-200 hover:bg-slate-50 transition"
    >
      <Card className="shadow-sm">
        <CardContent className="p-3">
          <p className="font-medium text-slate-900">{consult.doctor}</p>
          <p className="text-xs text-slate-500">{consult.specialty}</p>
          <p className="text-xs text-slate-500">
            {consult.date}, {consult.time}
          </p>
        </CardContent>
      </Card>
    </button>
  );
}
