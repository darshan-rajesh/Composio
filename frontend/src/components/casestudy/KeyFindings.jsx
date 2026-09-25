import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, Shield, Lock, Zap } from 'lucide-react';
import { Section, SectionLabel, SectionTitle, FadeIn } from './Primitives';

const findings = [
  {
    icon: Shield,
    tag: 'Authentication',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    headline: 'OAuth2 Dominates Modern SaaS Authentication',
    body: 'Over 68% of applications analyzed rely on OAuth2 as their primary authentication method. This near-universal adoption signals that any integration toolkit must treat OAuth2 as a first-class citizen — not an afterthought.',
    stat: '68%',
    statLabel: 'OAuth2 adoption',
  },
  {
    icon: Zap,
    tag: 'API Standards',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    headline: 'REST Remains the Universal API Surface',
    body: 'REST APIs account for 82% of all application interfaces discovered. While GraphQL shows growing traction in developer-first tools, REST remains the standard integration target across every category.',
    stat: '82%',
    statLabel: 'REST API prevalence',
  },
  {
    icon: TrendingUp,
    tag: 'Accessibility',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    headline: 'Developer-First Products Expose the Most Open APIs',
    body: 'Apps in the DevTools and Infrastructure categories consistently ranked highest for buildability — offering self-serve API keys, rich SDKs, sandbox environments, and comprehensive documentation with minimal friction.',
    stat: '91%',
    statLabel: 'DevTools self-serve',
  },
  {
    icon: Lock,
    tag: 'Enterprise Patterns',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    headline: 'Enterprise Products Are Systematically Gated',
    body: 'CRM and HR platform APIs frequently require sales conversations, NDAs, and admin provisioning before access. This enterprise-gating pattern makes automated integration dramatically harder and creates real platform risk.',
    stat: '43%',
    statLabel: 'Enterprise-gated rate',
  },
  {
    icon: Lightbulb,
    tag: 'Emerging Trends',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    headline: 'MCP Adoption Is Growing but Remains Early Stage',
    body: 'Only 23% of apps analyzed have a confirmed MCP integration — either official or community-maintained. This represents a significant opportunity for research engines to bridge gaps with hosted MCP servers at scale.',
    stat: '23%',
    statLabel: 'Confirmed MCP support',
  },
];

export function KeyFindings() {
  return (
    <Section id="findings" className="bg-bg-secondary/30">
      <FadeIn>
        <SectionLabel>Key Findings</SectionLabel>
        <SectionTitle sub="Strategic intelligence extracted from 100 researched applications across 10 enterprise software categories.">
          What the Data Reveals
        </SectionTitle>
      </FadeIn>

      <div className="space-y-5">
        {findings.map((f, i) => {
          const Icon = f.icon;
          return (
            <FadeIn key={f.tag} delay={i * 0.07}>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className="glass border-subtle rounded-3xl p-7 flex flex-col md:flex-row gap-6 md:gap-10 items-start group"
              >
                {/* Icon + tag */}
                <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:w-40 shrink-0">
                  <div className={`p-3 rounded-2xl border ${f.bg}`}>
                    <Icon size={20} className={f.color} />
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-widest ${f.color}`}>{f.tag}</span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-3 leading-tight">{f.headline}</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">{f.body}</p>
                </div>

                {/* Stat */}
                <div className="shrink-0 text-right">
                  <div className={`text-4xl font-bold ${f.color}`}>{f.stat}</div>
                  <div className="text-xs text-zinc-600 mt-1">{f.statLabel}</div>
                </div>
              </motion.div>
            </FadeIn>
          );
        })}
      </div>
    </Section>
  );
}
