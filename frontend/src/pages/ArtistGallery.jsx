import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Star } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/Section";
import { FilterGallery } from "@/components/FilterGallery";
import { GALLERY, IMAGES } from "@/data/content";
import { api, mediaSrc } from "@/lib/api";
import { useEnquiry } from "@/context/EnquiryContext";

const ARTIST_MEDIA = GALLERY.filter((g) => ["indian", "international", "mascots", "soundlight"].includes(g.cat));
const MEDIA_FILTERS = [
  { id: "all", label: "All" },
  { id: "indian", label: "Bollywood & Bhangra" },
  { id: "international", label: "Russian / International" },
  { id: "mascots", label: "Mascots" },
  { id: "soundlight", label: "DJ & Bands" },
];

const availabilityColor = (a) => {
  const t = (a || "").toLowerCase();
  if (t.includes("available")) return "text-green-400 bg-green-400/10 border-green-400/30";
  if (t.includes("request")) return "text-amber-400 bg-amber-400/10 border-amber-400/30";
  return "text-sky-400 bg-sky-400/10 border-sky-400/30";
};

export default function ArtistGallery() {
  const [artists, setArtists] = useState([]);
  const [gallery, setGallery] = useState(ARTIST_MEDIA);
  const [artistFilter, setArtistFilter] = useState("all");
  const { openEnquiry } = useEnquiry();

  useEffect(() => {
    api.get("/artists").then((res) => setArtists(res.data)).catch(() => {});
    api.get("/media").then((res) => {
      const artistCats = ["indian", "international", "mascots", "soundlight"];
      const mapped = res.data.filter((m) => artistCats.includes(m.category)).map((m) => ({ id: m.id, cat: m.category, title: m.title, img: mediaSrc(m.url) }));
      if (mapped.length) setGallery(mapped);
    }).catch(() => {});
  }, []);

  const artistCategories = ["all", ...Array.from(new Set(artists.map((a) => a.category)))];
  const filteredArtists = artistFilter === "all" ? artists : artists.filter((a) => a.category === artistFilter);

  return (
    <>
      <PageHero eyebrow="Talent Roster" title="Artist Gallery" subtitle="500+ performers — Bollywood, Bhangra, Russian dancers, mascots, DJs & celebrities." image={IMAGES.heroConcert} />

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeading eyebrow="Bookable Stars" title="Our Star Roster" subtitle="Handpicked performers ready to make your event dhamakedar. Book directly below." />

          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {artistCategories.map((c) => (
              <button
                key={c}
                data-testid={`artist-filter-${c.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                onClick={() => setArtistFilter(c)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                  artistFilter === c ? "tab-active border-transparent" : "border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                }`}
              >
                {c === "all" ? "All Artists" : c}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map((a, i) => (
              <motion.div
                key={a.id}
                data-testid={`artist-card-${a.id}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.08 }}
                className="group glass-card rounded-2xl overflow-hidden hover:gold-border-glow transition-all"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img src={mediaSrc(a.url)} alt={a.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140A10] via-transparent to-transparent" />
                  <span className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full border ${availabilityColor(a.availability)}`}>
                    {a.availability}
                  </span>
                  <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-yellow-500/90 text-[#0A0508]">{a.category}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, k) => <Star key={k} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <h3 className="font-display text-xl font-bold text-yellow-300">{a.name}</h3>
                  <p className="text-slate-400 text-sm mt-1 line-clamp-2">{a.bio}</p>
                  <button
                    data-testid={`artist-book-${a.id}`}
                    onClick={() => openEnquiry({ event_type: `Artist Booking - ${a.name}`, message: `I want to book ${a.name} (${a.category}).`, source: "artist-profile" })}
                    className="mt-4 w-full btn-glow bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0A0508] font-bold py-2.5 rounded-full flex items-center justify-center gap-2 text-sm"
                  >
                    <CalendarCheck className="w-4 h-4" /> Book Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0d070b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeading eyebrow="Performances" title="Gallery Highlights" />
          <FilterGallery items={gallery} filters={MEDIA_FILTERS} testPrefix="artist-gallery" />
        </div>
      </section>
    </>
  );
}
