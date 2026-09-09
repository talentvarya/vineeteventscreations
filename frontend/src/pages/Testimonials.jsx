import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote, PlayCircle } from "lucide-react";
import { PageHero } from "@/components/Section";
import { TESTIMONIALS, IMAGES } from "@/data/content";
import { api, mediaSrc } from "@/lib/api";
import { useEnquiry } from "@/context/EnquiryContext";

export default function Testimonials() {
  const { openEnquiry } = useEnquiry();
  const [items, setItems] = useState(TESTIMONIALS);

  useEffect(() => {
    api.get("/testimonials").then((res) => { if (res.data.length) setItems(res.data); }).catch(() => {});
  }, []);

  const videos = items.filter((t) => t.kind === "video" && t.url);

  return (
    <>
      <PageHero eyebrow="Client Reviews" title="Loved By Our Clients" subtitle="Real stories from families and companies who trusted us with their big day." image={IMAGES.heroConfetti} />

      {videos.length > 0 && (
        <section className="py-14 bg-[#0d070b]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white mb-6 flex items-center gap-2"><PlayCircle className="w-7 h-7 text-yellow-400" /> Video Testimonials</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.map((v, i) => (
                <div key={v.id || i} data-testid={`video-testimonial-${i}`} className="glass-card rounded-2xl overflow-hidden border border-yellow-500/15">
                  <video src={mediaSrc(v.url)} controls playsInline className="w-full aspect-video object-cover bg-black" />
                  <div className="p-4">
                    <div className="font-display font-bold text-yellow-400">{v.name}</div>
                    <div className="text-slate-400 text-sm">{v.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {items.map((t, i) => (
              <motion.div
                key={t.id || i}
                data-testid={`testimonial-card-${i}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 2) * 0.1 }}
                className="relative glass-card rounded-2xl p-7 hover:gold-border-glow transition-all"
              >
                <Quote className="w-10 h-10 text-yellow-500/30 mb-3" />
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating || 5)].map((_, k) => <Star key={k} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="font-serif-accent text-lg text-slate-200 italic leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-500 to-amber-700 flex items-center justify-center font-display font-black text-[#0A0508]">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-display font-bold text-yellow-400">{t.name}</div>
                    <div className="text-slate-400 text-sm">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-14">
            <h3 className="font-display text-2xl sm:text-3xl font-black text-white mb-4">Ready to be our next happy client?</h3>
            <button
              data-testid="testimonials-cta-button"
              onClick={() => openEnquiry({ source: "testimonials" })}
              className="btn-glow pulse-glow bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0A0508] font-bold px-8 py-3.5 rounded-full"
            >
              Book Your Free Consultation
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
