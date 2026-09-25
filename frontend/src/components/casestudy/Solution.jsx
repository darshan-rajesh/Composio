import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FileText, Search, Brain, ShieldCheck, UserCheck, BarChart3, Download, ArrowDown } from 'lucide-react';
import { Section, SectionLabel, SectionTitle, FadeIn } from './Primitives';

const archSteps = [
  { icon: FileText, label: 'CSV Dataset', sub: '100 apps × 3 fields', color: 'text-zinc-300', bg: 'bg-zinc-800/80 border-zinc-700/50' },
  { icon: Search, label: 'Research Agent', sub: 'Tavily web search', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  { icon: Brain, label: 'Gemini Analysis', sub: 'Reasoning + extraction', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  { icon: ShieldCheck, label: 'Verification Agent', sub: 'Cross-validation', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  { icon: UserCheck, label: 'Audit Layer', sub: 'Human review sample', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  { icon: BarChart3, label: 'Analytics Engine', sub: 'Pattern extraction', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
  { icon: Download, label: 'Export System', sub: 'Reports + case study', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30' },
];

function ArchNode({ step, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const Icon = step.icon;
  const isLast = index === archSteps.length - 1;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: index * 0.12, duration: 0.5, type: 'spring' }}
        className={`relative flex items-center gap-4 glass border rounded-2xl px-6 py-4 w-full max-w-sm ${step.bg}`}
      >
        <div className={`p-2.5 rounded-xl border ${step.bg} shrink-0`}>
          <Icon size={20} className={step.color} />
        </div>
        <div>
          <div className="font-semibold text-white text-sm">{step.label}</div>
          <div className="text-xs text-zinc-500">{step.sub}</div>
        </div>
        <div className="ml-auto">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </motion.div>
      {!isLast && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={inView ? { opacity: 1, height: 32 } : {}}
          transition={{ delay: index * 0.12 + 0.25, duration: 0.3 }}
          className="flex flex-col items-center"
        >
          <div className="w-px flex-1 bg-gradient-to-b from-amber-500/40 to-amber-500/10" style={{ height: 32 }} />
          <ArrowDown size={14} className="text-amber-500/60 -mt-1" />
        </motion.div>
      )}
    </div>
  );
}

export function Solution() {
  return (
    <Section id="solution" className="bg-bg-secondary/30">
      <FadeIn>
        <SectionLabel>The Solution</SectionLabel>
        <SectionTitle sub="A fully automated research pipeline driven by AI agents that discovers, analyzes, verifies, and reports SaaS intelligence at scale.">
          Multi-Agent Research Pipeline
        </SectionTitle>
      </FadeIn>

      <div className="grid lg:grid-cols-2 gap-16 items-start">
        {/* Architecture flow */}
        <FadeIn>
          <div className="flex flex-col items-center gap-0">
            {archSteps.map((step, i) => (
              <ArchNode key={step.label} step={step} index={i} />
            ))}
          </div>
        </FadeIn>

        {/* Right: explanation */}
        <div className="space-y-8">
          <FadeIn delay={0.1}>
            <div className="glass border-subtle rounded-3xl p-7">
              <div className="text-xs text-amber-500 uppercase tracking-widest mb-3 font-semibold">How it Works</div>
              <p className="text-zinc-300 leading-relaxed text-sm">
                The pipeline starts with a structured CSV input of 100 SaaS applications. A Research Agent autonomously queries each app using Tavily's real-time web search to find documentation, changelogs, and API references.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="glass border-subtle rounded-3xl p-7">
              <div className="text-xs text-blue-400 uppercase tracking-widest mb-3 font-semibold">AI Analysis Layer</div>
              <p className="text-zinc-300 leading-relaxed text-sm">
                Retrieved content is passed to Gemini Flash for structured reasoning. The model extracts auth protocols, API types, MCP availability, buildability verdicts, and confidence scores using constrained JSON output.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="glass border-subtle rounded-3xl p-7">
              <div className="text-xs text-purple-400 uppercase tracking-widest mb-3 font-semibold">Verification Loop</div>
              <p className="text-zinc-300 leading-relaxed text-sm">
                A secondary Verification Agent independently re-evaluates research findings, flags discrepancies, and applies corrections. This dual-agent loop significantly improves accuracy beyond single-pass research.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="glass border-subtle rounded-3xl p-7">
              <div className="text-xs text-green-400 uppercase tracking-widest mb-3 font-semibold">Human Audit Layer</div>
              <p className="text-zinc-300 leading-relaxed text-sm">
                A stratified 15-app sample is surfaced for human audit, allowing spot-checking of AI accuracy. Results feed back into the confidence scoring system for transparent reliability reporting.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </Section>
  );
}
