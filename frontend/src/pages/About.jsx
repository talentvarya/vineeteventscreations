import { motion } from "framer-motion";
import { PageHero, SectionHeading } from "@/components/Section";
import { StatCounter } from "@/components/StatCounter";
import { SparkParticles } from "@/components/SparkParticles";
import { BUSINESS, STATS, IMAGES } from "@/data/content";
import { ShieldCheck, Crown, Flame, Sparkles, MapPin } from "lucide-react";
import { useEnquiry } from "@/context/EnquiryContext";

const VALUES = [
  { icon: ShieldCheck, title: "Punctuality", desc: "Every event executed on time, every single time." },
  { icon: Crown, title: "Royalty", desc: "Grand, luxurious experiences fit for royalty." },
  { icon: Flame, title: "Explosive Entertainment", desc: "High-energy dhamaka that guests never forget." },
  { icon: Sparkles, title: "Flawless Production", desc: "Precision sound, light, stage & effects." },
];

const TIMELINE = [
  { year: "2007", text: "Vineet Events Creations founded in Dehradun with a dream to redefine celebrations." },
  { year: "2012", text: "Expanded into artist management — Bollywood troops, live bands & singers." },
  { year: "2016", text: "Launched international artist division with Russian performers & flair bartenders." },
  { year: "2020", text: "Added certified special-effects unit — cold pyro, CO2, lasers & projection mapping." },
  { year: "2026", text: "19+ years, 2500+ grand events and a PAN India presence — and still going dhamakedar." },
];

const CITIES = ["Dehradun", "Delhi NCR", "Jaipur", "Goa", "Mumbai", "Destination Weddings"];

export default function About() {
  const { openEnquiry } = useEnquiry();
  return (
    <>
      <PageHero eyebrow="Since 2007" title="19+ Years of Royal Celebrations" subtitle="From a small Dehradun dream to India's most dhamakedar event company." image={IMAGES.heroWedding} />

      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative rounded-2xl overflow-hidden gold-border-glow">
            <img src={IMAGES.founder} alt="Founder Vineet" className="w-full h-[480px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0508] via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <div className="font-display text-2xl font-bold text-yellow-400">Vineet</div>
              <div className="text-slate-300 text-sm">Founder & Creative Head</div>
            </div>
          </motion.div>
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-yellow-500 uppercase mb-3">Our Story</p>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white mb-6 leading-tight">A Journey Built On <span className="gold-gradient-text">Trust & Dhamaka</span></h2>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>For over <span className="text-yellow-400 font-semibold">19 years</span>, Vineet Events Creations has been turning ordinary occasions into extraordinary, unforgettable celebrations. What began as a passion project in Dehradun has grown into a full-service event powerhouse trusted across India.</p>
              <p>"Har event ek kahani hai" — every event is a story, and we craft each one with royal grandeur, explosive entertainment and flawless production. From intimate kitty parties to grand destination weddings and high-stakes corporate galas, we deliver the WOW.</p>
              <p className="font-serif-accent text-xl text-yellow-300 italic">"19 Saal Se Aapke Sapno Ke Events Ko Real Banate Hue."</p>
            </div>
            <button onClick={() => openEnquiry({ source: "about" })} data-testid="about-cta-button" className="mt-8 btn-glow bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0A0508] font-bold px-8 py-3.5 rounded-full">
              Work With Us
            </button>
          </div>
        </div>
      </section>

      <section className="relative py-16 bg-gradient-to-r from-[#4C0519] via-[#140A10] to-[#4C0519] overflow-hidden">
        <SparkParticles density={30} color="255,77,0" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s, i) => <StatCounter key={i} {...s} testId={`about-stat-${i}`} />)}
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-[#0d070b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeading eyebrow="Core Values" title="What Drives Every Dhamaka" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass-card rounded-2xl p-6 text-center hover:gold-border-glow transition-all">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center mb-4">
                  <v.icon className="w-7 h-7 text-[#0A0508]" />
                </div>
                <h3 className="font-display font-bold text-yellow-400 mb-2">{v.title}</h3>
                <p className="text-slate-400 text-sm">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <SectionHeading eyebrow="Our Journey" title="19 Years of Milestones" />
          <div className="relative pl-8 border-l-2 border-yellow-500/30 space-y-10">
            {TIMELINE.map((t, i) => (
              <motion.div key={t.year} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="relative">
                <div className="absolute -left-[41px] w-5 h-5 rounded-full bg-yellow-500 border-4 border-[#0A0508] shadow-[0_0_12px_rgba(234,179,8,0.8)]" />
                <div className="font-display text-2xl font-black gold-gradient-text">{t.year}</div>
                <p className="text-slate-300 mt-1">{t.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-[#0d070b]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <SectionHeading eyebrow="PAN India Reach" title="We Bring The Dhamaka Everywhere" />
          <div className="flex flex-wrap justify-center gap-4">
            {CITIES.map((c) => (
              <div key={c} className="glass-card rounded-full px-6 py-3 border border-yellow-500/25 flex items-center gap-2 text-slate-200 font-semibold">
                <MapPin className="w-4 h-4 text-yellow-500" /> {c}
              </div>
            ))}
          </div>
          <p className="text-slate-400 mt-8">Based in <span className="text-yellow-400">{BUSINESS.address}</span></p>
        </div>
      </section>
    </>
  );
}
