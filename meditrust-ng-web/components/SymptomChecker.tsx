"use client";
import { useState, useEffect } from "react";
import { TriageResponse } from "@/app/api/triage/route";
import { accessToken } from "./SessionSync";

export default function SymptomChecker({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [symptom, setSymptom] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState("");
  const [extras, setExtras] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTriage = async () => {
    if (!accessToken) {
      console.error("No access token available");
      return;
    }

    const combinedSymptoms = `${symptom}, ${duration}, ${severity}${
      extras.length ? ", " + extras.join(", ") : ""
    }`;

    // Build request body with the key "symptoms"
    const requestBody = {
      symptoms: combinedSymptoms,
    };

    try {
      setLoading(true);
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody), // symptoms wrapped correctly
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Triage API Error:", errText);
        return;
      }

      const result: TriageResponse = await res.json();
      setTriageResult(result);
    } catch (err) {
      console.error("Triage API error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger triage when finishing step 4
  useEffect(() => {
    if (step === 5) {
      handleTriage();
    }
  }, [step]);

  const toggleExtra = (e: string) => {
    setExtras((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    );
  };

  const handleFinish = () => {
    setSubmitted(true);
    setStep(5);
  };

  return (
    <div className="text-white">
      {/* Step 1 */}
      {step === 1 && (
        <>
          <h2 className="text-lg font-semibold mb-3">
            What's your main symptom?
          </h2>
          <input
            type="text"
            placeholder="e.g., Headache"
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#0A0F0D]/80 border border-gray-700 text-white placeholder-gray-500"
          />
          <button
            disabled={!symptom}
            onClick={() => setStep(2)}
            className="btn-primary w-full mt-4"
          >
            Next
          </button>
        </>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <>
          <h2 className="text-lg font-semibold mb-3">
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
                className={`w-full py-2 px-3 rounded-lg border ${
                  duration === d
                    ? "bg-[#00CFC1] text-black"
                    : "bg-[#0A0F0D]/80 border-gray-700 text-white"
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
          <h2 className="text-lg font-semibold mb-3">How severe is it?</h2>
          <div className="space-y-2">
            {["Mild", "Moderate", "Severe"].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSeverity(s);
                  setStep(4);
                }}
                className={`w-full py-2 px-3 rounded-lg border ${
                  severity === s
                    ? "bg-[#00CFC1] text-black"
                    : "bg-[#0A0F0D]/80 border-gray-700 text-white"
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
          <h2 className="text-lg font-semibold mb-3">Any other symptoms?</h2>
          <div className="space-y-2">
            {["Fever", "Cough", "Nausea", "Dizziness"].map((e) => (
              <label
                key={e}
                className="flex items-center gap-2 text-sm cursor-pointer"
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
          <button onClick={handleFinish} className="btn-primary w-full mt-4">
            Finish
          </button>
        </>
      )}

      {/* Step 5 */}
      {step === 5 && submitted && (
        <>
          <h2 className="text-lg font-semibold mb-3">Your Summary</h2>
          <p className="text-sm text-gray-300">
            <strong>Symptom:</strong> {symptom}
          </p>
          <p className="text-sm text-gray-300">
            <strong>Duration:</strong> {duration}
          </p>
          <p className="text-sm text-gray-300">
            <strong>Severity:</strong> {severity}
          </p>
          <p className="text-sm text-gray-300">
            <strong>Other Symptoms:</strong> {extras.join(", ") || "None"}
          </p>

          <div className="mt-4 p-3 rounded-lg bg-[#0A0F0D]/70 border border-gray-700 text-sm text-gray-200">
            ⚠️ This is not a diagnosis. Based on your input, you may want to{" "}
            <span className="text-[#00CFC1]">book an appointment</span> with a
            doctor for further evaluation.
            <div className="mt-2">
              {loading && <span>🔄 Analyzing your symptoms...</span>}
              {!loading && triageResult && (
                <span>
                  Recommended specialty:{" "}
                  <span className="text-[#00CFC1]">
                    {triageResult.specialty}
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 rounded-lg text-sm"
            >
              Close
            </button>
            <a
              href="/appointments"
              className="px-4 py-2 bg-[#00CFC1] text-[#0A0F0D] font-semibold rounded-lg text-sm"
            >
              Book Appointment
            </a>
          </div>
        </>
      )}
    </div>
  );
}
