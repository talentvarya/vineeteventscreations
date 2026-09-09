import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/Section";
import { BLOGS, IMAGES } from "@/data/content";

export default function Blog() {
  const [featured, ...rest] = BLOGS;
  return (
    <>
      <PageHero eyebrow="Insights & Trends" title="The Dhamaka Blog" subtitle="Tips, trends & ideas to make your next event legendary." image={IMAGES.heroPyro} />
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Link to={`/blog/${featured.slug}`} data-testid="blog-featured" className="group grid lg:grid-cols-2 gap-8 glass-card rounded-2xl overflow-hidden mb-14 hover:gold-border-glow transition-all">
            <div className="h-64 lg:h-auto overflow-hidden">
              <img src={featured.img} alt={featured.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">Featured • {featured.tag} • {featured.date}</span>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-yellow-300 mt-3 group-hover:text-yellow-400">{featured.title}</h2>
              <p className="text-slate-400 mt-4">{featured.excerpt}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-yellow-400 font-semibold">Read Article <ArrowRight className="w-4 h-4" /></span>
            </div>
          </Link>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((b, i) => (
              <motion.div key={b.slug} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link to={`/blog/${b.slug}`} data-testid={`blog-card-${b.slug}`} className="group block glass-card rounded-2xl overflow-hidden hover:gold-border-glow transition-all h-full">
                  <div className="h-44 overflow-hidden">
                    <img src={b.img} alt={b.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">{b.tag} • {b.date}</span>
                    <h3 className="font-display text-lg font-bold text-yellow-300 mt-2 group-hover:text-yellow-400">{b.title}</h3>
                    <p className="text-slate-400 text-sm mt-2 line-clamp-3">{b.excerpt}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
