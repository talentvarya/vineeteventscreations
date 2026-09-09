import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BUSINESS } from "@/data/content";
import { useEnquiry } from "@/context/EnquiryContext";

const NAV = [
  { to: "/", label: "Home", id: "home" },
  { to: "/about", label: "About", id: "about" },
  { to: "/services", label: "Services", id: "services" },
  { to: "/artists", label: "Artists", id: "artist-gallery" },
  { to: "/events", label: "Events", id: "events-gallery" },
  { to: "/testimonials", label: "Reviews", id: "testimonials" },
  { to: "/blog", label: "Blog", id: "blog" },
  { to: "/contact", label: "Contact", id: "contact" },
];

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { openEnquiry } = useEnquiry();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-card border-b border-yellow-500/20 py-2" : "bg-gradient-to-b from-black/80 to-transparent py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2 group shrink-0">
          <Sparkles className="w-6 h-6 text-yellow-400 group-hover:rotate-12 transition-transform" />
          <div className="leading-none">
            <div className="font-display font-black text-base sm:text-lg gold-gradient-text tracking-wide">VINEET EVENTS</div>
            <div className="text-[9px] sm:text-[10px] tracking-[0.35em] text-slate-400 uppercase">Creations</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.id}
              to={n.to}
              data-testid={`nav-link-${n.id}`}
              className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                pathname === n.to ? "text-yellow-400" : "text-slate-200 hover:text-yellow-300"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <a
            href={`tel:${BUSINESS.phoneRaw}`}
            data-testid="header-call-button"
            className="flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-yellow-300"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden xl:inline">{BUSINESS.phone}</span>
          </a>
          <button
            data-testid="header-enquire-button"
            onClick={() => openEnquiry()}
            className="btn-glow pulse-glow bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0A0508] font-bold text-sm px-5 py-2.5 rounded-full"
          >
            Book Event
          </button>
        </div>

        <button
          className="lg:hidden text-yellow-400 p-1"
          data-testid="mobile-menu-toggle"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden glass-card border-t border-yellow-500/20"
          >
            <div className="px-5 py-4 flex flex-col gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.id}
                  to={n.to}
                  data-testid={`mobile-nav-${n.id}`}
                  className={`py-2.5 text-base font-semibold border-b border-white/5 ${
                    pathname === n.to ? "text-yellow-400" : "text-slate-200"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
              <div className="flex gap-3 mt-3">
                <a href={`tel:${BUSINESS.phoneRaw}`} className="flex-1 text-center py-2.5 rounded-full border border-yellow-500/40 text-yellow-300 font-semibold text-sm">
                  Call Now
                </a>
                <button
                  onClick={() => openEnquiry()}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0A0508] font-bold text-sm py-2.5 rounded-full"
                >
                  Book Event
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
