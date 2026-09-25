import { motion } from 'framer-motion';
import { Layers, Zap, ShieldCheck, BarChart3, GitBranch } from 'lucide-react';
import { Section, SectionLabel, SectionTitle, FadeIn, Counter } from './Primitives';

const kpis = [
  { icon: Layers, label: 'Applications Researched', value: 100, suffix: '', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', desc: 'Spanning 10 enterprise software categories' },
  { icon: GitBranch, label: 'Categories Analyzed', value: 10, suffix: '', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', desc: 'CRM, DevTools, Productivity & more' },
  { icon: Zap, label: 'Research Automated', value: 94, suffix: '%', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', desc: 'End-to-end multi-agent pipeline' },
  { icon: ShieldCheck, label: 'Avg Confidence Score', value: 86, suffix: '%', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', desc: 'Verified through dual-agent system' },
  { icon: BarChart3, label: 'Data Points Captured', value: 2400, suffix: '+', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', desc: 'Auth, API, MCP, buildability & more' },
];

export function ExecutiveSummary() {
  return (
    <Section id="summary" className="bg-bg-secondary/50">
      <FadeIn>
        <SectionLabel>Executive Summary</SectionLabel>
        <SectionTitle
          sub="A complete picture of the modern SaaS integration landscape, researched and verified by autonomous AI agents."
        >
          Ecosystem Intelligence <br />at Scale
        </SectionTitle>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <FadeIn key={kpi.label} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="glass border-subtle rounded-3xl p-7 shadow-card group cursor-default"
              >
                <div className={`inline-flex p-3 rounded-2xl border mb-5 ${kpi.bg}`}>
                  <Icon size={22} className={kpi.color} />
                </div>
                <div className={`text-4xl font-bold mb-2 ${kpi.color}`}>
                  <Counter to={kpi.value} suffix={kpi.suffix} />
                </div>
                <div className="text-base font-semibold text-white mb-1">{kpi.label}</div>
                <div className="text-sm text-zinc-500">{kpi.desc}</div>
              </motion.div>
            </FadeIn>
          );
        })}
      </div>
    </Section>
  );
}
