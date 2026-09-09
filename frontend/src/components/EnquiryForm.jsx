import { useState } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { SERVICES } from "@/data/content";

const BUDGETS = ["Under ₹1 Lakh", "₹1-5 Lakh", "₹5-15 Lakh", "₹15 Lakh+", "Not sure yet"];

export const fireConfetti = () => {
  const colors = ["#EAB308", "#FF4D00", "#FF007A", "#FACC15", "#E11D48"];
  const end = Date.now() + 800;
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0 }, colors });
    confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 }, colors });
};

export const EnquiryForm = ({ prefill = {}, compact = false, onDone }) => {
  const [form, setForm] = useState({
    name: "", phone: "", email: "", event_type: prefill.event_type || "",
    event_date: "", city: "", budget: "", message: prefill.message || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Please enter your name and phone number.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.post("/enquiries", { ...form, source: prefill.source || "website" });
      setSuccess(true);
      fireConfetti();
      if (onDone) setTimeout(onDone, 2600);
    } catch (err) {
      setError("Something went wrong. Please call us at +91-8588838594.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8 px-4" data-testid="enquiry-success">
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="font-display text-2xl font-bold gold-gradient-text mb-2">Dhamaka! 🎉</h3>
        <p className="text-slate-300">Your enquiry is received. Our team will call you shortly on <span className="text-yellow-400 font-semibold">{form.phone}</span>.</p>
      </div>
    );
  }

  const fieldCls = "w-full bg-[#1e0f18] border border-yellow-500/20 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-yellow-500/60 transition-colors";

  return (
    <form onSubmit={submit} className="space-y-4" data-testid="enquiry-form">
      <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
        <input data-testid="enquiry-form-name-input" value={form.name} onChange={set("name")} placeholder="Your Name *" className={fieldCls} />
        <input data-testid="enquiry-form-phone-input" value={form.phone} onChange={set("phone")} placeholder="Phone Number *" className={fieldCls} />
      </div>
      <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
        <select data-testid="enquiry-form-service-select" value={form.event_type} onChange={set("event_type")} className={fieldCls}>
          <option value="">Event / Service Type</option>
          {SERVICES.map((s) => <option key={s.id} value={s.title}>{s.title}</option>)}
          <option value="Other">Other</option>
        </select>
        <input data-testid="enquiry-form-date-input" type="date" value={form.event_date} onChange={set("event_date")} className={fieldCls} />
      </div>
      <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
        <input data-testid="enquiry-form-city-input" value={form.city} onChange={set("city")} placeholder="Event City" className={fieldCls} />
        <select data-testid="enquiry-form-budget-select" value={form.budget} onChange={set("budget")} className={fieldCls}>
          <option value="">Approx Budget</option>
          {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <textarea data-testid="enquiry-form-message-input" value={form.message} onChange={set("message")} placeholder="Tell us about your dream event..." rows={compact ? 2 : 3} className={fieldCls} />
      {error && <p className="text-red-400 text-sm" data-testid="enquiry-form-error">{error}</p>}
      <button
        type="submit"
        data-testid="enquiry-form-submit-button"
        disabled={submitting}
        className="w-full btn-glow pulse-glow bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-[#0A0508] font-black text-base py-3.5 rounded-full disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Get My Free Quote 🎆"}
      </button>
    </form>
  );
};
