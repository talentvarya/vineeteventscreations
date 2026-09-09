import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { ChevronRight, Star, Phone, Flame, ArrowRight } from "lucide-react";
import { SparkParticles } from "@/components/SparkParticles";
import { StatCounter } from "@/components/StatCounter";
import { SectionHeading } from "@/components/Section";
import { EnquiryForm } from "@/components/EnquiryForm";
import { useEnquiry } from "@/context/EnquiryContext";
import { BUSINESS, STATS, SERVICES, GALLERY, TESTIMONIALS, BLOGS, IMAGES } from "@/data/content";
import { InstagramFeed } from "@/components/InstagramFeed";
import { api, mediaSrc } from "@/lib/api";
import { useState, useEffect } from "react";

const HERO_IMAGES = [IMAGES.heroConcert, IMAGES.heroWedding, IMAGES.heroPyro, IMAGES.heroConfetti];

const Hero = () => {
  const { openEnquiry } = useEnquiry();
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % HERO_IMAGES.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden section-grain">
      {HERO_IMAGES.map((img, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity"
          style={{ opacity: i === idx ? 1 : 0, transitionDuration: "1400ms" }}
        >
          <img src={img} alt="" className="w-full h-full object-cover scale-105" />
        </div>
      ))}
      <div className="absolute inset-0 hero-vignette" />
      <SparkParticles density={55} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full pt-24 pb-16">
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-yellow-500/30 mb-6"
            >
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold tracking-[0.2em] text-yellow-300 uppercase">{BUSINESS.years} Years • PAN India • Dhamakedar</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase leading-[0.95] text-white"
            >
              Turning Events Into<br />
              <span className="gold-gradient-text drop-shadow-[0_4px_30px_rgba(234,179,8,0.5)]">Unforgettable</span><br />
              <span className="fire-gradient-text">Experiences</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed"
            >
              India's most <span className="text-yellow-400 font-semibold">dhamakedar</span> event experience — grand weddings, dazzling artists, Russian performers, cold-pyro effects, celebrity bookings & full-on entertainment punch.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <button
                data-testid="hero-enquire-now-button"
                onClick={() => openEnquiry()}
                className="btn-glow pulse-glow bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-[#0A0508] font-black text-base px-8 py-4 rounded-full flex items-center gap-2"
              >
                Book a Free Consultation <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href={`tel:${BUSINESS.phoneRaw}`}
                data-testid="hero-call-now-button"
                className="btn-glow border-2 border-yellow-500/50 text-yellow-300 font-bold text-base px-8 py-4 rounded-full flex items-center gap-2 hover:bg-yellow-500/10"
              >
                <Phone className="w-5 h-5" /> Call Now
              </a>
            </motion.div>

            <div className="mt-10 flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                <span className="ml-2 text-sm text-slate-300 font-semibold">2500+ Happy Celebrations</span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="lg:col-span-2 glass-card rounded-2xl p-6 gold-border-glow"
          >
            <h3 className="font-display text-xl font-bold gold-gradient-text mb-1">Quick Enquiry</h3>
            <p className="text-slate-400 text-sm mb-4">Get a free quote in minutes 🎆</p>
            <EnquiryForm compact prefill={{ source: "home-hero" }} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const iconFor = (name) => Icons[name] || Icons.Sparkles;

const ServicesSection = () => {
  const { openEnquiry } = useEnquiry();
  return (
    <section className="relative py-20 sm:py-28 section-grain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <SectionHeading eyebrow="What We Do" title="Full-On Entertainment Punch" subtitle="From royal weddings to explosive stage effects — one team, every dhamaka." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => {
            const Icon = iconFor(s.icon);
            return (
              <motion.div
                key={s.id}
                data-testid={`home-service-card-${s.id}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="group relative glass-card rounded-2xl overflow-hidden hover:gold-border-glow transition-all duration-300"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140A10] via-[#140A10]/40 to-transparent" />
                  <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-[#0A0508]" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-yellow-400 mb-1">{s.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{s.tagline}</p>
                  <div className="flex items-center justify-between">
                    <Link to="/services" className="text-sm font-semibold text-slate-300 hover:text-yellow-300 flex items-center gap-1">
                      Explore <ChevronRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => openEnquiry({ event_type: s.title, source: "home-service" })}
                      className="text-xs font-bold px-3 py-1.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500 hover:text-[#0A0508] transition-colors"
                    >
                      Enquire
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const StatsSection = () => (
  <section className="relative py-16 sm:py-20 bg-gradient-to-r from-[#4C0519] via-[#140A10] to-[#4C0519] overflow-hidden">
    <SparkParticles density={30} color="255,77,0" />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {STATS.map((s, i) => <StatCounter key={i} {...s} testId={`home-stat-${i}`} />)}
      </div>
    </div>
  </section>
);

const GalleryPreview = () => {
  const [items, setItems] = useState(GALLERY.slice(0, 8));
  useEffect(() => {
    api.get("/media").then((res) => {
      const mapped = res.data.slice(0, 8).map((m) => ({ id: m.id, title: m.title, img: mediaSrc(m.url) }));
      if (mapped.length) setItems(mapped);
    }).catch(() => {});
  }, []);
  return (
    <section className="relative py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading eyebrow="Recent Dhamaka" title="Grand Events Highlight Reel" subtitle="A glimpse of the magic we create — weddings, concerts, pyro & more." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {items.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`group relative rounded-xl overflow-hidden ${i % 5 === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
            >
              <img src={g.img} alt={g.title} className="w-full h-full min-h-[140px] object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-sm font-semibold text-yellow-300">{g.title}</span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/events" className="btn-glow inline-flex items-center gap-2 border-2 border-yellow-500/50 text-yellow-300 font-bold px-8 py-3.5 rounded-full hover:bg-yellow-500/10">
            View Full Gallery <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

const WhyUs = () => {
  const points = [
    { title: "19+ Years of Trust", desc: "Nearly two decades of flawless, grand celebrations across India." },
    { title: "500+ Artist Network", desc: "Bollywood, Bhangra, Russian performers, celebrities & mascots on call." },
    { title: "Explosive Special FX", desc: "Certified cold pyro, CO2, confetti, fog & laser show specialists." },
    { title: "PAN India Service", desc: "Dehradun to Delhi, Jaipur, Goa, Mumbai & destination weddings." },
  ];
  return (
    <section className="relative py-20 sm:py-28 bg-[#0d070b] section-grain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-14 items-center relative">
        <div>
          <p className="text-xs font-bold tracking-[0.3em] text-yellow-500 uppercase mb-3">Why Choose Us</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
            <span className="gold-gradient-text">19 Saal</span> Se Aapke Sapno Ke Events Ko Real Banate Hue
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-8">
            We don't just plan events — we engineer unforgettable experiences with royal grandeur and high-energy entertainment punch.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {points.map((p) => (
              <div key={p.title} className="glass-card rounded-xl p-5 border border-yellow-500/15">
                <h4 className="font-display font-bold text-yellow-400 mb-1">{p.title}</h4>
                <p className="text-slate-400 text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden gold-border-glow float-slow"
        >
          <img src={IMAGES.heroPyro} alt="Grand event" className="w-full h-[460px] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0508] via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 glass-card rounded-xl px-5 py-4 border border-yellow-500/30">
            <div className="font-display text-3xl font-black gold-gradient-text">2500+</div>
            <div className="text-xs text-slate-300 tracking-wide uppercase">Grand Events Delivered</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const TestimonialsPreview = () => {
  const [list, setList] = useState(TESTIMONIALS);
  const [i, setI] = useState(0);
  useEffect(() => {
    api.get("/testimonials").then((res) => { if (res.data.length) setList(res.data); }).catch(() => {});
  }, []);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % list.length), 5000);
    return () => clearInterval(t);
  }, [list.length]);
  const t = list[i] || list[0];
  return (
    <section className="relative py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <SectionHeading eyebrow="Client Love" title="What Our Clients Say" />
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 sm:p-12 text-center gold-border-glow"
        >
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(t.rating || 5)].map((_, k) => <Star key={k} className="w-6 h-6 fill-yellow-400 text-yellow-400" />)}
          </div>
          <p className="font-serif-accent text-xl sm:text-2xl text-slate-200 italic leading-relaxed mb-6">"{t.text}"</p>
          <div className="font-display font-bold text-yellow-400 text-lg">{t.name}</div>
          <div className="text-slate-400 text-sm">{t.role}</div>
        </motion.div>
        <div className="flex justify-center gap-2 mt-6">
          {list.map((_, k) => (
            <button key={k} onClick={() => setI(k)} className={`h-2 rounded-full transition-all ${k === i ? "w-8 bg-yellow-500" : "w-2 bg-yellow-500/30"}`} aria-label={`Testimonial ${k + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
};

const BlogPreview = () => (
  <section className="relative py-20 sm:py-28 bg-[#0d070b]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <SectionHeading eyebrow="Insights" title="Latest Entertainment Trends" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {BLOGS.slice(0, 3).map((b, i) => (
          <motion.div
            key={b.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link to={`/blog/${b.slug}`} className="group block glass-card rounded-2xl overflow-hidden hover:gold-border-glow transition-all">
              <div className="h-44 overflow-hidden">
                <img src={b.img} alt={b.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-5">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">{b.tag} • {b.date}</span>
                <h3 className="font-display text-lg font-bold text-yellow-300 mt-2 group-hover:text-yellow-400 line-clamp-2">{b.title}</h3>
                <p className="text-slate-400 text-sm mt-2 line-clamp-2">{b.excerpt}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const FinalCTA = () => {
  const { openEnquiry } = useEnquiry();
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0">
        <img src={IMAGES.heroConfetti} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#0A0508]/85" />
      </div>
      <SparkParticles density={40} />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-display text-3xl sm:text-5xl font-black uppercase text-white leading-tight">
          Ready For A <span className="fire-gradient-text">Dhamakedar</span> Event?
        </h2>
        <p className="mt-5 text-slate-300 text-lg max-w-2xl mx-auto">Let's turn your celebration into the talk of the town. Book your free consultation today.</p>
        <button
          data-testid="final-cta-button"
          onClick={() => openEnquiry({ source: "home-final-cta" })}
          className="mt-8 btn-glow pulse-glow bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-[#0A0508] font-black text-lg px-10 py-4 rounded-full inline-flex items-center gap-2"
        >
          Book a Free Consultation <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <>
      <Hero />
      <StatsSection />
      <ServicesSection />
      <GalleryPreview />
      <WhyUs />
      <TestimonialsPreview />
      <InstagramFeed />
      <BlogPreview />
      <FinalCTA />
    </>
  );
}
