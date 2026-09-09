import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { Check } from "lucide-react";
import { PageHero } from "@/components/Section";
import { SERVICES, IMAGES } from "@/data/content";
import { useEnquiry } from "@/context/EnquiryContext";

const iconFor = (name) => Icons[name] || Icons.Sparkles;

export default function Services() {
  const [active, setActive] = useState(SERVICES[0].id);
  const { openEnquiry } = useEnquiry();
  const svc = SERVICES.find((s) => s.id === active);
  const Icon = iconFor(svc.icon);

  return (
    <>
      <PageHero eyebrow="360° Event Management" title="Our Services" subtitle="Everything you need for a dhamakedar event — under one royal roof." image={IMAGES.heroConcert} />

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {SERVICES.map((s) => (
              <button
                key={s.id}
                data-testid={`service-tab-${s.id}`}
                onClick={() => setActive(s.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                  active === s.id ? "tab-active border-transparent" : "border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="grid lg:grid-cols-2 gap-10 items-center"
            >
              <div className="relative rounded-2xl overflow-hidden gold-border-glow">
                <img src={svc.image} alt={svc.title} className="w-full h-[420px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0508]/70 to-transparent" />
                <div className="absolute top-5 left-5 w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-[#0A0508]" />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.3em] text-yellow-500 uppercase mb-3">{svc.tagline}</p>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-white mb-6">{svc.title}</h2>
                <ul className="space-y-3 mb-8">
                  {svc.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-slate-300">
                      <span className="w-6 h-6 rounded-full bg-yellow-500/15 border border-yellow-500/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-yellow-400" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <button
                  data-testid={`service-enquire-${svc.id}`}
                  onClick={() => openEnquiry({ event_type: svc.title, source: "services" })}
                  className="btn-glow pulse-glow bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0A0508] font-bold px-8 py-3.5 rounded-full"
                >
                  Enquire Now
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="py-16 bg-[#0d070b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => {
              const I = iconFor(s.icon);
              return (
                <div key={s.id} className="glass-card rounded-2xl p-6 border border-yellow-500/15">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center mb-4">
                    <I className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="font-display font-bold text-yellow-400 mb-1">{s.title}</h3>
                  <p className="text-slate-400 text-sm">{s.tagline}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
