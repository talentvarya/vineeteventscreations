import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Instagram, Play, Heart } from "lucide-react";
import { api, mediaSrc } from "@/lib/api";
import { BUSINESS } from "@/data/content";
import { SectionHeading } from "@/components/Section";

export const InstagramFeed = () => {
  const [reels, setReels] = useState([]);

  useEffect(() => {
    api.get("/media", { params: { reel: true } })
      .then((res) => setReels(res.data.slice(0, 8)))
      .catch(() => setReels([]));
  }, []);

  if (reels.length === 0) return null;

  return (
    <section className="relative py-20 sm:py-28 bg-[#0d070b] section-grain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <SectionHeading eyebrow="@vineeteventscreations" title="Live From Our Reels" subtitle="Catch the latest dhamaka from our recent events on Instagram." />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {reels.map((r, i) => (
            <motion.a
              key={r.id}
              href={BUSINESS.instagram}
              target="_blank"
              rel="noreferrer"
              data-testid={`instagram-reel-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 4) * 0.06 }}
              className="group relative aspect-[4/5] rounded-xl overflow-hidden"
            >
              {r.kind === "video" ? (
                <video src={mediaSrc(r.url)} autoPlay muted loop playsInline className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <img src={mediaSrc(r.url)} alt={r.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 right-3 text-white/90">
                {r.kind === "video" ? <Play className="w-5 h-5 fill-white" /> : <Instagram className="w-5 h-5" />}
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Heart className="w-4 h-4 fill-white" />
                <span className="text-xs font-semibold">{r.title}</span>
              </div>
            </motion.a>
          ))}
        </div>
        <div className="text-center mt-10">
          <a
            href={BUSINESS.instagram}
            target="_blank"
            rel="noreferrer"
            data-testid="instagram-follow-button"
            className="btn-glow inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 via-rose-500 to-amber-500 text-white font-bold px-8 py-3.5 rounded-full"
          >
            <Instagram className="w-5 h-5" /> Follow @vineeteventscreations
          </a>
        </div>
      </div>
    </section>
  );
};
