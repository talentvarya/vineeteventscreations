import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageCircle, ChevronDown } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/Section";
import { EnquiryForm } from "@/components/EnquiryForm";
import { BUSINESS, FAQS, IMAGES } from "@/data/content";

const CONTACTS = [
  { icon: Phone, label: "Call Us", value: BUSINESS.phone, href: `tel:${BUSINESS.phoneRaw}` },
  { icon: MessageCircle, label: "WhatsApp", value: "+974 71913089", href: `https://wa.me/${BUSINESS.whatsapp}` },
  { icon: Mail, label: "Email", value: BUSINESS.email, href: `mailto:${BUSINESS.email}` },
  { icon: MapPin, label: "Visit Us", value: BUSINESS.address, href: "#map" },
];

const Faq = ({ q, a, idx }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card rounded-xl overflow-hidden border border-yellow-500/15">
      <button
        data-testid={`faq-toggle-${idx}`}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-slate-100">{q}</span>
        <ChevronDown className={`w-5 h-5 text-yellow-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="px-5 pb-4 text-slate-400 text-sm">{a}</p>}
    </div>
  );
};

export default function Contact() {
  return (
    <>
      <PageHero eyebrow="Get In Touch" title="Book Your Event Today" subtitle="Free consultation • Custom plan • Quick callback. Let's create magic!" image={IMAGES.heroConfetti} />

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12">
          <div>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {CONTACTS.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  data-testid={`contact-${c.label.toLowerCase().replace(/\s/g, "-")}`}
                  className="glass-card rounded-xl p-5 border border-yellow-500/15 hover:gold-border-glow transition-all flex items-start gap-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shrink-0">
                    <c.icon className="w-5 h-5 text-[#0A0508]" />
                  </div>
                  <div>
                    <div className="text-xs text-yellow-500 uppercase tracking-wide font-bold">{c.label}</div>
                    <div className="text-slate-200 text-sm mt-1 break-words">{c.value}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="glass-card rounded-xl p-5 border border-yellow-500/15 flex items-center gap-3 mb-8">
              <Clock className="w-5 h-5 text-yellow-400" />
              <div className="text-sm text-slate-300"><span className="font-semibold text-yellow-300">Office Hours:</span> Mon–Sun, 9:00 AM – 9:00 PM</div>
            </div>

            <div id="map" className="rounded-xl overflow-hidden gold-border-glow h-72">
              <iframe
                title="Vineet Events Location"
                src="https://www.google.com/maps?q=Canal+Road+Dehradun+Uttarakhand&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-2xl p-6 sm:p-8 gold-border-glow h-fit">
            <h3 className="font-display text-2xl font-black gold-gradient-text mb-1">Send Your Enquiry</h3>
            <p className="text-slate-400 text-sm mb-6">Fill in the details and our team will call you back with a custom plan.</p>
            <EnquiryForm prefill={{ source: "contact-page" }} />
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-[#0d070b]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <SectionHeading eyebrow="FAQ" title="Quick Answers" />
          <div className="space-y-3">
            {FAQS.map((f, i) => <Faq key={i} {...f} idx={i} />)}
          </div>
        </div>
      </section>
    </>
  );
}
