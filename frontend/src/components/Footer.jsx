import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, Sparkles } from "lucide-react";
import { BUSINESS } from "@/data/content";

export const Footer = () => {
  return (
    <footer className="relative bg-[#0A0508] border-t border-yellow-500/20 pt-16 pb-8 overflow-hidden">
      <div className="divider-shimmer absolute top-0 inset-x-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <div className="font-display font-black text-lg gold-gradient-text">VINEET EVENTS</div>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            India's most dhamakedar event experience. Turning your events into unforgettable royal celebrations for{" "}
            <span className="text-yellow-400 font-bold">{BUSINESS.years} years</span>.
          </p>
          <div className="flex gap-3 mt-5">
            {[
              { Icon: Instagram, href: BUSINESS.instagram, id: "instagram" },
              { Icon: Facebook, href: BUSINESS.facebook, id: "facebook" },
              { Icon: Youtube, href: BUSINESS.youtube, id: "youtube" },
            ].map(({ Icon, href, id }) => (
              <a
                key={id}
                href={href}
                target="_blank"
                rel="noreferrer"
                data-testid={`footer-social-${id}`}
                className="w-10 h-10 rounded-full border border-yellow-500/30 flex items-center justify-center text-yellow-400 hover:bg-yellow-500 hover:text-[#0A0508] transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-yellow-400 font-bold mb-4 tracking-wide">Quick Links</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            {[
              ["Home", "/"], ["About Us", "/about"], ["Services", "/services"],
              ["Artist Gallery", "/artists"], ["Events", "/events"], ["Blog", "/blog"],
            ].map(([label, to]) => (
              <li key={to}>
                <Link to={to} className="hover:text-yellow-300 transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-yellow-400 font-bold mb-4 tracking-wide">Our Services</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            {["Wedding Planning", "Indian & Russian Artists", "Mascot Characters", "Special Effects & Pyro", "Sound, Light & DJ", "Celebrity Booking"].map((s) => (
              <li key={s}><Link to="/services" className="hover:text-yellow-300 transition-colors">{s}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-yellow-400 font-bold mb-4 tracking-wide">Get In Touch</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
              <span>{BUSINESS.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-yellow-500 shrink-0" />
              <a href={`tel:${BUSINESS.phoneRaw}`} className="hover:text-yellow-300">{BUSINESS.phone}</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-yellow-500 shrink-0" />
              <a href={`mailto:${BUSINESS.email}`} className="hover:text-yellow-300 break-all">{BUSINESS.email}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} {BUSINESS.name}. All rights reserved. PAN India Event Management.</p>
        <p>{BUSINESS.years} Years of Trust • Dehradun • PAN India</p>
      </div>
    </footer>
  );
};
