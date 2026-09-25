import { Section, SectionLabel, SectionTitle, FadeIn, Counter } from './Primitives';
import { motion } from 'framer-motion';
import { GitFork, Code2, Layout, BarChart2, Shield, ArrowUpRight } from 'lucide-react';

const impactMetrics = [
  { value: 100, suffix: '', label: 'Apps Analyzed', sub: 'Across 10 SaaS categories' },
  { value: 320, suffix: 'h', label: 'Research Hours Saved', sub: 'vs. manual methodology' },
  { value: 94, suffix: '%', label: 'Research Automated', sub: 'End-to-end pipeline' },
  { value: 2400, suffix: '+', label: 'Data Points Captured', sub: 'Structured intelligence' },
];

const repoModules = [
  { icon: Code2, title: 'Research Pipeline', desc: 'Multi-agent AI orchestration with Gemini + Tavily', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { icon: Layout, title: 'Frontend Dashboard', desc: 'React + Vite enterprise analytics interface', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { icon: BarChart2, title: 'Analytics Engine', desc: 'Distribution analysis and insight generation', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  { icon: Shield, title: 'Verification Layer', desc: 'Dual-agent accuracy and confidence scoring', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
];

export function Impact() {
  return (
    <>
      {/* Impact Metrics */}
      <Section id="impact" className="bg-bg-secondary/30">
        <FadeIn>
          <SectionLabel>Impact</SectionLabel>
          <SectionTitle sub="Quantified results from deploying the SaaS Research Engine.">
            By the Numbers
          </SectionTitle>
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {impactMetrics.map((m, i) => (
            <FadeIn key={m.label} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="glass border-subtle rounded-3xl p-7 text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-gradient-amber mb-2">
                  <Counter to={m.value} suffix={m.suffix} />
                </div>
                <div className="font-semibold text-white mb-1 text-sm">{m.label}</div>
                <div className="text-xs text-zinc-600">{m.sub}</div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* GitHub Section */}
      <Section id="github" className="bg-bg-primary">
        <FadeIn>
          <SectionLabel>Source Code</SectionLabel>
          <SectionTitle sub="The full implementation is available as an open research artifact.">
            GitHub Repository
          </SectionTitle>
        </FadeIn>

        <FadeIn delay={0.1}>
          <motion.div
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.2 }}
            className="glass border-subtle rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-2xl">
                    <GitFork size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">saas-research-engine</div>
                    <div className="text-sm text-zinc-500">MIT License · Public Repository</div>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
                  A complete end-to-end multi-agent research pipeline for autonomous SaaS intelligence generation, with verification, auditing, analytics, and case study export.
                </p>
              </div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-glow whitespace-nowrap hover:scale-[1.02] shrink-0"
              >
                View Repository
                <ArrowUpRight size={16} />
              </a>
            </div>
          </motion.div>
        </FadeIn>

        {/* Module cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repoModules.map((m, i) => {
            const Icon = m.icon;
            return (
              <FadeIn key={m.title} delay={0.15 + i * 0.07}>
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                  className="glass border-subtle rounded-2xl p-5 flex items-center gap-4 cursor-pointer group"
                >
                  <div className={`p-2.5 rounded-xl border ${m.bg}`}>
                    <Icon size={18} className={m.color} />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors">{m.title}</div>
                    <div className="text-xs text-zinc-500">{m.desc}</div>
                  </div>
                  <ArrowUpRight size={14} className="ml-auto text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                </motion.div>
              </FadeIn>
            );
          })}
        </div>
      </Section>
    </>
  );
}
