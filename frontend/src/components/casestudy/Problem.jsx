import { motion } from 'framer-motion';
import { AlertTriangle, Clock, DollarSign, FileX } from 'lucide-react';
import { Section, SectionLabel, SectionTitle, FadeIn } from './Primitives';

const painPoints = [
  { icon: Clock, title: 'Time Intensive', desc: 'Manually researching a single SaaS app takes 2–4 hours of developer time — API docs, auth flows, SDKs, and limitations all need individual investigation.' },
  { icon: FileX, title: 'Inconsistent Results', desc: 'Human researchers produce inconsistent outputs. Different reviewers apply different criteria, making it impossible to compare apps objectively at scale.' },
  { icon: DollarSign, title: 'Prohibitive Cost', desc: 'Covering 100 apps manually at $80/hr engineering cost translates to over $32,000 in labor — before verification, documentation, and maintenance.' },
  { icon: AlertTriangle, title: 'Rapidly Outdated', desc: 'SaaS API surfaces evolve constantly. Manual research snapshots become stale within weeks, creating dangerously outdated integration intelligence.' },
];

export function Problem() {
  return (
    <Section id="problem" className="bg-bg-primary">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        {/* Left: text */}
        <div>
          <FadeIn>
            <SectionLabel>The Problem</SectionLabel>
            <SectionTitle>Manual SaaS Research Doesn't Scale</SectionTitle>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              Integration builders, developer tool vendors, and platform teams need deep, reliable intelligence about SaaS applications — their authentication protocols, API surfaces, MCP capabilities, and buildability.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              Doing this manually across hundreds of applications is an engineering bottleneck that doesn't scale. Every hour spent researching is an hour not spent building.
            </p>
          </FadeIn>

          <FadeIn delay={0.2} className="mt-10">
            <div className="glass border-subtle rounded-2xl p-6">
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Each App Requires:</div>
              {[
                'Authentication flow analysis (OAuth2, API Key, SAML)',
                'API surface discovery (REST, GraphQL, WebSocket)',
                'Documentation quality review',
                'MCP / integration capability evaluation',
                'Buildability & access model assessment',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Right: pain point cards */}
        <div className="grid grid-cols-1 gap-4">
          {painPoints.map((p, i) => {
            const Icon = p.icon;
            return (
              <FadeIn key={p.title} delay={0.1 + i * 0.08}>
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                  className="glass border-subtle rounded-2xl p-6 flex gap-5"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-red-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white mb-1">{p.title}</div>
                    <div className="text-sm text-zinc-500 leading-relaxed">{p.desc}</div>
                  </div>
                </motion.div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
