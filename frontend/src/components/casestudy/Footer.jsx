import { motion } from 'framer-motion';
import { GitFork, ArrowUp, Mail } from 'lucide-react';
import { FadeIn } from './Primitives';

export function Footer() {
  return (
    <section className="relative py-32 bg-bg-primary overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-amber-500/6 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass border-subtle rounded-full mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs text-zinc-400">Research Engine SaaS Intelligence Platform · 2024</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight mb-6">
            Building trustworthy AI systems requires not only automation, but{' '}
            <span className="text-gradient-amber">verification.</span>
          </h2>

          <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl mx-auto mb-12">
            This project demonstrates that autonomous research pipelines can produce reliable, auditable intelligence — when designed with verification, transparency, and honest confidence reporting at their core.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-glow hover:scale-[1.02]"
            >
              <GitFork size={16} />
              View Repository
            </a>
            <a
              href="mailto:hello@composio.dev"
              className="inline-flex items-center gap-2 glass border-subtle hover:bg-zinc-800/60 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02]"
            >
              <Mail size={16} />
              Contact
            </a>
          </div>
        </FadeIn>

        {/* Back to top */}
        <FadeIn delay={0.2}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-300 transition-colors group"
          >
            <ArrowUp size={14} className="group-hover:-translate-y-1 transition-transform" />
            Back to top
          </button>
        </FadeIn>

        {/* Nav links */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap items-center justify-center gap-8 text-xs text-zinc-700">
          {['Summary', 'Problem', 'Solution', 'Workflow', 'Findings', 'Analysis', 'Results', 'Challenges'].map(l => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="hover:text-zinc-400 transition-colors"
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
