"use client";
import { useState, useEffect } from "react";
import { TriageResponse } from "@/app/api/triage/route";
import { ConsultAssignRequest } from "@/app/api/assign-consult-and-pay/route";
import Button from "./ui/Button";
import { supabase } from "@/lib/supabaseClient";
import { publish } from "@/lib/eventBus";

let consult_id_cache = "";
let consult_specialty = "";
export default function SymptomChecker() {
  const [step, setStep] = useState(1);
  const [symptom, setSymptom] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState("");
  const [extras, setExtras] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResponse | null>(null);
  const [triageID, setTriageID] = useState<string>("");
  const [consultRequest, setConsultRequest] = useState<ConsultAssignRequest>();
  const [loading, setLoading] = useState(false);
  const [accessToken, setToken] = useState("");

  let triage_response = "";
  const handleTriage = async () => {
    const combinedSymptoms = `${symptom}, ${duration}, ${severity}${
      extras.length ? ", " + extras.join(", ") : ""
    }`;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      setToken(session.access_token);
      //console.log("ACCESSTOKEN: ", accessToken);
      setLoading(true);
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ symptoms: combinedSymptoms }),
      });
      if (!res.ok) throw new Error(await res.text());
      const result: TriageResponse = await res.json();
      setTriageResult(result);
      setTriageID(result.triage_id);
      console.log("TRIAGE:", triage_response);
    } catch (e) {
      console.error("Triage API error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 5) handleTriage();
  }, [step]);

  const toggleExtra = (e: string) =>
    setExtras((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    );

  const Finish = () => {
    setSubmitted(true);
    setStep(5);
  };

  const onClose = () => {
    setLoading(false);
    setSymptom("");
    setDuration("");
    setSeverity("");
    setSubmitted(false);
    setStep(1);
  };

  const onStartConsult = async () => {
    console.log("Repsonse: ", triage_response);
     try{
      
        const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      //console.log("Proxy token:", accessToken);
      const res1 = await fetch("/api/consult-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ triage_id: triageID }),
      });
       if (!res1.ok) throw new Error(await res1.text());
      let output  = await res1.json();
      setConsultRequest(output);
      

      
      const res2 = await fetch("/api/assign-consult-and-pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          consult_id: output.consult_id,
          specialty: output.specialty,
        }),
      });;

      if (!res2.ok) throw new Error(await res2.text());
      const result2 = await res2.json();
      console.log("status of consult: ", result2.status);
      console.log("doctor assigned: ", result2.doctor_id);

      // check status and act
      // if (result2.status === "requested") {
      //     publish(1);
      // }else{
      //   publish(0);
      // }
     }catch(e){
      console.log('Consult Request Error: ', e)
     }
  };
  return (
    <div className="text-slate-900">
      {/* Step 1 */}
      {step === 1 && (
        <>
          <h2 className="mb-3 text-black-700 font-SF Pro bold">
            How do you feel today?
          </h2>
          <input
            type="text"
            placeholder="e.g., Headache, Fever, ..."
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <Button
            disabled={!symptom}
            onClick={() => setStep(2)}
            className="mt-4 w-full"
          >
            Next
          </Button>
        </>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <>
          <h2 className="mb-3 text-lg font-semibold">
            How long have you had it?
          </h2>
          <div className="space-y-2">
            {["Less than a day", "1-3 days", "More than a week"].map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDuration(d);
                  setStep(3);
                }}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                  duration === d
                    ? "border-teal-300 bg-teal-50 text-teal-900"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <>
          <h2 className="mb-3 text-lg font-semibold">How severe is it?</h2>
          <div className="space-y-2">
            {["Mild", "Moderate", "Severe"].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSeverity(s);
                  setStep(4);
                }}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                  severity === s
                    ? "border-teal-300 bg-teal-50 text-teal-900"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <>
          <h2 className="mb-3 text-lg font-semibold">Any other symptoms?</h2>
          <div className="space-y-2">
            {["Fever", "Cough", "Nausea", "Dizziness"].map((e) => (
              <label
                key={e}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={extras.includes(e)}
                  onChange={() => toggleExtra(e)}
                />
                {e}
              </label>
            ))}
          </div>
          <Button onClick={Finish} className="mt-4 w-full">
            Finish
          </Button>
        </>
      )}

      {/* Step 5 */}
      {step === 5 && submitted && (
        <>
          <h2 className="mb-3 text-lg font-semibold">Your Summary</h2>
          <p className="text-sm text-slate-700">
            <strong>Symptom:</strong> {symptom}
          </p>
          <p className="text-sm text-slate-700">
            <strong>Duration:</strong> {duration}
          </p>
          <p className="text-sm text-slate-700">
            <strong>Severity:</strong> {severity}
          </p>
          <p className="text-sm text-slate-700">
            <strong>Other Symptoms:</strong> {extras.join(", ") || "None"}
          </p>{" "}
          <div className="mt-4 p-3 rounded-lg bg-gray-200 border border-gray-300 text-sm text-gray-500">
            ⚠️ This is not a diagnosis. Based on your input, you may want to{" "}
            <span className="text-cyan-400">start a consultation </span> with a
            doctor for further evaluation.
            <div className="mt-2">
              {loading && <span>🔄 Analyzing your symptoms...</span>}
              {!loading && triageResult && (
                <span>
                  Recommended specialty:{" "}
                  <span className="text-cyan">
                    {triageResult.specialty}
                  </span>
                </span>
              )}
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-800 "
            >
              Close
            </button>
            <button onClick={onStartConsult} className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-300">
              Start Consult
            </button>
          </div>
        </>
      )}
    </div>
  );
}