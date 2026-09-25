import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { Section, SectionLabel, SectionTitle, FadeIn } from './Primitives';

const challenges = [
  {
    type: 'challenge',
    icon: AlertCircle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    title: 'Rate Limiting & API Throttling',
    desc: 'Gemini API had intermittent 503 availability issues under concurrent load. Solved with exponential backoff (5 retries, 60s cap) and sequential batch processing with per-app timeouts.',
  },
  {
    type: 'win',
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    title: 'AI Excelled at Documentation Parsing',
    desc: 'Gemini was remarkably capable at extracting structured information from unstructured developer docs. Given a URL\'s content, it reliably identified auth flows, endpoint patterns, and SDK availability with high confidence.',
  },
  {
    type: 'challenge',
    icon: AlertCircle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    title: 'Enterprise Products Resisted Automation',
    desc: 'Many enterprise apps (Workday, SAP, Oracle) deliberately obscure API documentation behind NDAs or sales walls. Tavily searches returned only marketing content, forcing low-confidence "Unknown" classifications.',
  },
  {
    type: 'win',
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    title: 'Verification Loops Meaningfully Improved Accuracy',
    desc: 'Running a second-pass verification agent on research findings caught 18% discrepancies — primarily in auth classification and MCP availability. This dual-pass design is critical for trustworthy AI output.',
  },
  {
    type: 'challenge',
    icon: AlertCircle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    title: 'Human Audit Revealed Hallucination Patterns',
    desc: 'In 12% of human-audited cases, the AI confidently stated MCP availability that did not actually exist. This was mitigated through confidence score penalties and mandatory "Unknown" defaults when evidence was sparse.',
  },
  {
    type: 'next',
    icon: Lightbulb,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    title: 'What Would Improve This Next',
    desc: 'Periodic re-research cadence (apps change fast), direct source scraping instead of search-based discovery, fine-tuned models for developer documentation parsing, and integration with live API testing for ground-truth verification.',
  },
];

export function Challenges() {
  return (
    <Section id="challenges" className="bg-bg-primary">
      <FadeIn>
        <SectionLabel>Challenges & Learnings</SectionLabel>
        <SectionTitle sub="Honest reflection on where automation succeeded, where it struggled, and what the next iteration would look like.">
          What Worked. What Didn't. What's Next.
        </SectionTitle>
      </FadeIn>

      <div className="grid md:grid-cols-2 gap-5">
        {challenges.map((c, i) => {
          const Icon = c.icon;
          return (
            <FadeIn key={c.title} delay={i * 0.07}>
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="glass border-subtle rounded-3xl p-7 h-full"
              >
                <div className={`inline-flex p-2.5 rounded-xl border mb-5 ${c.bg}`}>
                  <Icon size={18} className={c.color} />
                </div>
                <h3 className="text-base font-bold text-white mb-3">{c.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{c.desc}</p>
              </motion.div>
            </FadeIn>
          );
        })}
      </div>
    </Section>
  );
}
