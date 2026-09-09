import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEnquiry } from "@/context/EnquiryContext";
import { EnquiryForm } from "@/components/EnquiryForm";

export const EnquiryModal = () => {
  const { open, setOpen, prefill } = useEnquiry();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          data-testid="enquiry-modal-overlay"
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg glass-card rounded-2xl p-6 sm:p-8 gold-border-glow max-h-[92vh] overflow-y-auto"
          >
            <button
              onClick={() => setOpen(false)}
              data-testid="enquiry-modal-close"
              className="absolute top-4 right-4 text-slate-400 hover:text-yellow-400"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center mb-6">
              <p className="text-xs font-bold tracking-[0.25em] text-yellow-500 uppercase">Free Consultation</p>
              <h3 className="font-display text-2xl sm:text-3xl font-black gold-gradient-text mt-1">Book Your Dhamaka Event</h3>
              <p className="text-slate-400 text-sm mt-2">Share your details — our team calls you back with a custom plan.</p>
            </div>
            <EnquiryForm prefill={prefill} onDone={() => setOpen(false)} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
