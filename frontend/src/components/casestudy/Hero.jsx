import { motion } from 'framer-motion';
import { ArrowDown, GitFork, ExternalLink, Sparkles, Brain, Database, Shield } from 'lucide-react';

const floatingVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
};

const metrics = [
  { label: 'Apps Analyzed', value: '100' },
  { label: 'Categories', value: '10' },
  { label: 'Data Points', value: '2.4K' },
  { label: 'Confidence Avg', value: '86%' },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bg-primary">
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-40" />

      {/* Radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-amber-500/8 via-amber-500/2 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Floating orbital rings */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[600px] h-[600px] rounded-full border border-white/[0.03]"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[800px] h-[800px] rounded-full border border-white/[0.025]"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[1000px] h-[1000px] rounded-full border border-white/[0.015]"
        />
      </div>

      {/* Floating cards */}
      <motion.div
        variants={floatingVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute left-[4%] top-[28%] hidden xl:flex glass border-subtle rounded-2xl px-4 py-3 items-center gap-3"
        style={{ animation: 'float 7s ease-in-out infinite' }}
      >
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Brain size={16} className="text-amber-500" />
        </div>
        <div>
          <div className="text-xs font-semibold text-white">Gemini Flash</div>
          <div className="text-[10px] text-zinc-500">Analysis Agent</div>
        </div>
      </motion.div>

      <motion.div
        variants={floatingVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute right-[4%] top-[32%] hidden xl:flex glass border-subtle rounded-2xl px-4 py-3 items-center gap-3"
        style={{ animation: 'float 8s ease-in-out 2s infinite' }}
      >
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Shield size={16} className="text-blue-400" />
        </div>
        <div>
          <div className="text-xs font-semibold text-white">Verification Layer</div>
          <div className="text-[10px] text-zinc-500">Multi-pass accuracy</div>
        </div>
      </motion.div>

      <motion.div
        variants={floatingVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 1.8, duration: 0.6 }}
        className="absolute left-[6%] bottom-[28%] hidden xl:flex glass border-subtle rounded-2xl px-4 py-3 items-center gap-3"
        style={{ animation: 'float 9s ease-in-out 1s infinite' }}
      >
        <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <Database size={16} className="text-green-400" />
        </div>
        <div>
          <div className="text-xs font-semibold text-white">100 SaaS Apps</div>
          <div className="text-[10px] text-zinc-500">Research complete</div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 glass border-subtle rounded-full px-4 py-1.5 mb-8"
        >
          <Sparkles size={13} className="text-amber-500" />
          <span className="text-xs text-zinc-400 font-medium">AI-Powered Research Platform · Case Study</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6"
        >
          <span className="text-white">Research Engine </span>
          <span className="text-gradient-amber">SaaS Intelligence</span>
          <br />
          <span className="text-white">Platform</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Automated SaaS application research, verification, auditing, and intelligence generation powered by AI agents.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-20"
        >
          <a
            href="#findings"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-glow hover:shadow-glow hover:scale-[1.02]"
          >
            View Findings
            <ArrowDown size={16} />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 glass border-subtle hover:bg-zinc-800/60 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02]"
          >
            <GitFork size={16} />
            View GitHub
          </a>
        </motion.div>

        {/* Metrics row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5"
        >
          {metrics.map((m, i) => (
            <div key={i} className="bg-bg-primary px-6 py-5 text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">{m.value}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest">{m.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-600"
      >
        <ArrowDown size={20} />
      </motion.div>
    </section>
  );
}
