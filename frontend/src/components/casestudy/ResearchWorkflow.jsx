import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Upload, Globe, Code, Key, Hammer, CheckCircle, TrendingUp } from 'lucide-react';
import { Section, SectionLabel, SectionTitle, FadeIn } from './Primitives';

const steps = [
  {
    num: '01',
    icon: Upload,
    title: 'Import Applications',
    desc: 'A structured CSV dataset containing 100 SaaS applications is loaded into the pipeline. Each entry includes the app name, category, and website URL as seed data for research.',
    tag: 'Data Ingestion',
    color: 'text-zinc-300',
    bg: 'bg-zinc-700/20 border-zinc-700/30',
  },
  {
    num: '02',
    icon: Globe,
    title: 'Discover Documentation',
    desc: 'The Research Agent uses Tavily\'s real-time search API to find official documentation pages, API references, changelog entries, and developer portal links for each application.',
    tag: 'Web Research',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    num: '03',
    icon: Code,
    title: 'Analyze API Surface',
    desc: 'Gemini Flash analyzes retrieved content to identify REST, GraphQL, gRPC, or WebSocket endpoints, SDK availability, rate limits, versioning patterns, and webhook capabilities.',
    tag: 'AI Analysis',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    num: '04',
    icon: Key,
    title: 'Extract Authentication Methods',
    desc: 'Every authentication protocol is catalogued — OAuth2, API Keys, SAML, JWT, and OpenID. Access models (self-serve vs. enterprise-gated) are also classified.',
    tag: 'Security Analysis',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    num: '05',
    icon: Hammer,
    title: 'Evaluate Buildability',
    desc: 'A composite buildability score is computed based on documentation quality, API openness, SDK maturity, authentication complexity, and integration ecosystem richness.',
    tag: 'Scoring',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
  {
    num: '06',
    icon: CheckCircle,
    title: 'Verify Results',
    desc: 'A secondary verification pass re-evaluates each finding independently. Discrepancies are flagged, corrected, and logged. Human audit samples provide ground-truth calibration.',
    tag: 'Verification',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
  {
    num: '07',
    icon: TrendingUp,
    title: 'Generate Intelligence',
    desc: 'The Analytics Engine aggregates all findings into distributions, trend patterns, and strategic insights — surfaced as a live dashboard and a professional case study report.',
    tag: 'Analytics',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20',
  },
];

function TimelineStep({ step, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const Icon = step.icon;
  const isLast = index === steps.length - 1;

  return (
    <div ref={ref} className="relative flex gap-8">
      {/* Line */}
      {!isLast && (
        <div className="absolute left-[19px] top-14 w-px h-[calc(100%-40px)] bg-gradient-to-b from-white/10 to-transparent" />
      )}

      {/* Step circle */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.1, duration: 0.4, type: 'spring' }}
        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${step.bg}`}
      >
        <Icon size={18} className={step.color} />
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="pb-12"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${step.color}`}>{step.tag}</span>
          <span className="text-xs text-zinc-700">{step.num}</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
        <p className="text-sm text-zinc-500 leading-relaxed max-w-lg">{step.desc}</p>
      </motion.div>
    </div>
  );
}

export function ResearchWorkflow() {
  return (
    <Section id="workflow" className="bg-bg-primary">
      <FadeIn>
        <SectionLabel>Research Workflow</SectionLabel>
        <SectionTitle sub="Seven coordinated steps transform a raw app list into verified, structured SaaS intelligence.">
          How the Pipeline Works
        </SectionTitle>
      </FadeIn>

      <div className="mt-4">
        {steps.map((step, i) => (
          <TimelineStep key={step.num} step={step} index={i} />
        ))}
      </div>
    </Section>
  );
}
