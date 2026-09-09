import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEnquiry } from "@/context/EnquiryContext";

export const FilterGallery = ({ items, filters, defaultFilter = "all", testPrefix = "gallery" }) => {
  const [active, setActive] = useState(defaultFilter);
  const [lightbox, setLightbox] = useState(null);
  const { openEnquiry } = useEnquiry();

  const filtered = active === "all" ? items : items.filter((i) => i.cat === active);

  const move = (dir) => {
    const idx = filtered.findIndex((i) => i.id === lightbox.id);
    const next = (idx + dir + filtered.length) % filtered.length;
    setLightbox(filtered[next]);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 justify-center mb-10">
        {filters.map((f) => (
          <button
            key={f.id}
            data-testid={`${testPrefix}-filter-${f.id}`}
            onClick={() => setActive(f.id)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
              active === f.id ? "tab-active border-transparent" : "border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <motion.div layout className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        <AnimatePresence>
          {filtered.map((g, i) => (
            <motion.div
              key={g.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: (i % 8) * 0.04 }}
              data-testid={`${testPrefix}-item-${g.id}`}
              onClick={() => setLightbox(g)}
              className="group relative rounded-xl overflow-hidden cursor-pointer break-inside-avoid"
            >
              <img src={g.img} alt={g.title} className="w-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-sm font-semibold text-yellow-300">{g.title}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
            data-testid={`${testPrefix}-lightbox`}
          >
            <button className="absolute top-6 right-6 text-white/80 hover:text-yellow-400" onClick={() => setLightbox(null)} aria-label="Close">
              <X className="w-8 h-8" />
            </button>
            <button className="absolute left-4 sm:left-8 text-white/70 hover:text-yellow-400" onClick={(e) => { e.stopPropagation(); move(-1); }} aria-label="Previous">
              <ChevronLeft className="w-10 h-10" />
            </button>
            <motion.div
              key={lightbox.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full"
            >
              <img src={lightbox.img} alt={lightbox.title} className="w-full max-h-[75vh] object-contain rounded-xl" />
              <div className="flex items-center justify-between mt-4">
                <h3 className="font-display text-xl font-bold text-yellow-400">{lightbox.title}</h3>
                <button
                  onClick={() => { openEnquiry({ event_type: lightbox.title, source: "gallery" }); setLightbox(null); }}
                  className="btn-glow bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0A0508] font-bold px-6 py-2.5 rounded-full text-sm"
                >
                  Book This
                </button>
              </div>
            </motion.div>
            <button className="absolute right-4 sm:right-8 text-white/70 hover:text-yellow-400" onClick={(e) => { e.stopPropagation(); move(1); }} aria-label="Next">
              <ChevronRight className="w-10 h-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
