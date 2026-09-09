import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export const StatCounter = ({ value, suffix = "", label, testId }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1600;
    const startTime = performance.now();
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * value));
      if (p < 1) requestAnimationFrame(step);
      else setCount(value);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      data-testid={testId}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <div className="font-display text-4xl sm:text-5xl lg:text-6xl font-black gold-gradient-text drop-shadow-[0_2px_20px_rgba(234,179,8,0.4)]">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="mt-2 text-xs sm:text-sm tracking-[0.2em] uppercase text-slate-300 font-semibold">
        {label}
      </div>
    </motion.div>
  );
};
