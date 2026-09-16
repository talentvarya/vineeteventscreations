import { useState, useEffect } from "react";
import { PageHero } from "@/components/Section";
import { Seo } from "@/components/Seo";
import { FilterGallery } from "@/components/FilterGallery";
import { GALLERY, GALLERY_FILTERS, IMAGES } from "@/data/content";
import { api, mediaSrc } from "@/lib/api";

export default function EventsGallery() {
  const [items, setItems] = useState(GALLERY);

  useEffect(() => {
    api.get("/media")
      .then((res) => {
        const mapped = res.data.map((m) => ({ id: m.id, cat: m.category, title: m.title, img: mediaSrc(m.url) }));
        if (mapped.length) setItems(mapped);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Seo
        title="Events Gallery | Weddings, Concerts & Celebrations - Vineet Events Creations"
        description="Browse our portfolio of royal weddings, corporate galas, cold-pyro effects and DJ nights — a cinematic look at events by Vineet Events Creations."
        path="/events"
        image={IMAGES.heroWedding}
      />
      <PageHero eyebrow="Portfolio" title="Events Gallery" subtitle="A cinematic look at the royal weddings, concerts & celebrations we've created." image={IMAGES.heroWedding} />
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FilterGallery items={items} filters={GALLERY_FILTERS} testPrefix="events-gallery" />
        </div>
      </section>
    </>
  );
}
