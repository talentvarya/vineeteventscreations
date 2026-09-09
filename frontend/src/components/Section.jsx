import { motion } from "framer-motion";

export const SectionHeading = ({ eyebrow, title, subtitle, center = true }) => (
  <div className={`${center ? "text-center mx-auto" : ""} max-w-3xl mb-12`}>
    {eyebrow && (
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-xs font-bold tracking-[0.3em] text-yellow-500 uppercase mb-3"
      >
        {eyebrow}
      </motion.p>
    )}
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight"
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="mt-4 text-slate-400 text-base sm:text-lg leading-relaxed"
      >
        {subtitle}
      </motion.p>
    )}
    {center && <div className="w-24 h-1 mx-auto mt-6 rounded-full bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />}
  </div>
);

export const PageHero = ({ eyebrow, title, subtitle, image }) => (
  <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
    <div className="absolute inset-0">
      <img src={image} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0508]/85 via-[#0A0508]/80 to-[#0A0508]" />
    </div>
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
      {eyebrow && <p className="text-xs font-bold tracking-[0.3em] text-yellow-500 uppercase mb-4">{eyebrow}</p>}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase gold-gradient-text drop-shadow-[0_4px_24px_rgba(234,179,8,0.4)] leading-none"
      >
        {title}
      </motion.h1>
      {subtitle && <p className="mt-5 text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  </section>
);
