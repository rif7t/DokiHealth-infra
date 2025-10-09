'use client';

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function ContactForm() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    let prefill = "";
    if (type === "demo")
      prefill =
        "I’d like to schedule a demo to see how the telehealth integration works for hospitals.";
    else if (type === "hospital-inquiry")
      prefill =
        "We’re interested in understanding how to bring video consultations to our hospital site.";
    else if (type === "partnership")
      prefill = "I’d like to explore partnership options with DokiHealth.";

    setForm((prev) => ({ ...prev, message: prefill }));
  }, [type]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const response = await fetch("https://formspree.io/f/xjkaabwb", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      alert("Message sent! We'll get back to you soon.");
      e.target.reset();
    } else {
      alert("Oops! Something went wrong. Please try again later.");
    }
  };

  const headers = {
    demo: "Request a Demo",
    "hospital-inquiry": "Hospital Partnership Inquiry",
    partnership: "Partnership Conversation",
  };

  return (
    <div className="min-h-screen bg-[#f7faff] flex flex-col items-center py-20 px-6">
      <div className="bg-white rounded-2xl shadow-md p-10 max-w-lg w-full">
        <h1 className="text-3xl font-semibold text-[#0B4FFF] mb-6 text-center">
          {headers[type] || "Contact DokiHealth"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg text-black px-4 py-2 focus:ring-2 focus:ring-[#0B4FFF] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg text-black px-4 py-2 focus:ring-2 focus:ring-[#0B4FFF] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Message</label>
            <textarea
              name="message"
              required
              rows={5}
              value={form.message}
              onChange={handleChange}
              className="w-full border border-gray-300 text-black rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0B4FFF] outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-[#0B4FFF] text-white w-full py-3 rounded-full shadow-md hover:opacity-90 transition"
          >
            Send Message
          </button>
        </form>
      </div>

      <div className="text-center mt-10 text-gray-500">
        or email us directly at{" "}
        <a
          href="mailto:founder@dokihealth.com"
          className="text-[#0B4FFF] underline"
        >
          founder@dokihealth.com
        </a>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ContactForm />
    </Suspense>
  );
}
