import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

// ─── Fade-in on scroll ──────────────────────────────────────────────────────
export function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Animated counter ───────────────────────────────────────────────────────
export function Counter({ to, duration = 2, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// ─── Section wrapper ────────────────────────────────────────────────────────
export function Section({ id, children, className = '' }) {
  return (
    <section id={id} className={`py-24 md:py-32 relative ${className}`}>
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        {children}
      </div>
    </section>
  );
}

// ─── Section label ───────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-6 h-px bg-amber-500" />
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">{children}</span>
    </div>
  );
}

// ─── Section title ───────────────────────────────────────────────────────────
export function SectionTitle({ children, sub }) {
  return (
    <div className="mb-16">
      <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">{children}</h2>
      {sub && <p className="mt-4 text-lg text-zinc-400 max-w-2xl leading-relaxed">{sub}</p>}
    </div>
  );
}
