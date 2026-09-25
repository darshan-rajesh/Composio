import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Section, SectionLabel, SectionTitle, FadeIn } from './Primitives';

const sampleApps = [
  { name: 'Salesforce', category: 'CRM', auth: 'OAuth2', api: 'REST + SOAP', mcp: 'Community', buildability: 'Medium', confidence: 88, access: 'Enterprise-Gated' },
  { name: 'Stripe', category: 'Payments', auth: 'API Key', api: 'REST', mcp: 'Official', buildability: 'High', confidence: 96, access: 'Self-Serve' },
  { name: 'GitHub', category: 'DevTools', auth: 'OAuth2', api: 'REST + GraphQL', mcp: 'Official', buildability: 'High', confidence: 97, access: 'Self-Serve' },
  { name: 'Slack', category: 'Productivity', auth: 'OAuth2', api: 'REST', mcp: 'Official', buildability: 'High', confidence: 93, access: 'Self-Serve' },
  { name: 'HubSpot', category: 'CRM', auth: 'OAuth2', api: 'REST', mcp: 'Community', buildability: 'High', confidence: 91, access: 'Self-Serve' },
  { name: 'Workday', category: 'HR', auth: 'OAuth2 + SAML', api: 'REST + SOAP', mcp: 'None', buildability: 'Low', confidence: 71, access: 'Enterprise-Gated' },
  { name: 'Notion', category: 'Productivity', auth: 'OAuth2', api: 'REST', mcp: 'Community', buildability: 'High', confidence: 89, access: 'Self-Serve' },
  { name: 'Shopify', category: 'E-Commerce', auth: 'OAuth2', api: 'REST + GraphQL', mcp: 'Community', buildability: 'High', confidence: 95, access: 'Self-Serve' },
];

const MCP_BADGE = {
  'Official': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Community': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Planned': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'None': 'bg-zinc-800 text-zinc-500 border-zinc-700',
};

const BUILD_BADGE = {
  'High': 'text-green-400',
  'Medium': 'text-amber-400',
  'Low': 'text-red-400',
};

export function SampleResults() {
  return (
    <Section id="results" className="bg-bg-secondary/30">
      <FadeIn>
        <SectionLabel>Sample Results</SectionLabel>
        <SectionTitle sub="A snapshot of structured intelligence extracted from the research pipeline for 8 representative applications.">
          Research Output Preview
        </SectionTitle>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="glass border-subtle rounded-3xl overflow-hidden shadow-card-lg">
          {/* Table header */}
          <div className="px-6 py-4 bg-zinc-900/50 border-b border-white/5">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              <span>Application</span>
              <span>Auth</span>
              <span>API Type</span>
              <span>Access</span>
              <span>MCP</span>
              <span>Buildability</span>
              <span>Score</span>
            </div>
          </div>

          {/* Rows */}
          {sampleApps.map((app, i) => (
            <motion.div
              key={app.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group"
            >
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center">
                {/* App */}
                <div>
                  <div className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors">{app.name}</div>
                  <div className="text-xs text-zinc-600">{app.category}</div>
                </div>

                {/* Auth */}
                <span className="text-xs font-mono text-zinc-400">{app.auth}</span>

                {/* API */}
                <span className="text-xs font-mono text-zinc-400">{app.api}</span>

                {/* Access */}
                <span className={`text-xs font-medium ${app.access === 'Self-Serve' ? 'text-green-400' : 'text-amber-400'}`}>
                  {app.access === 'Self-Serve' ? '◆ Open' : '⬡ Gated'}
                </span>

                {/* MCP */}
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${MCP_BADGE[app.mcp]}`}>
                  {app.mcp}
                </span>

                {/* Buildability */}
                <span className={`text-sm font-bold ${BUILD_BADGE[app.buildability]}`}>
                  {app.buildability}
                </span>

                {/* Confidence */}
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${app.confidence >= 90 ? 'bg-green-500' : app.confidence >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${app.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-zinc-400 tabular-nums">{app.confidence}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-zinc-700">
          Showing 8 of 100 researched applications · Full dataset available in the exported report
        </p>
      </FadeIn>
    </Section>
  );
}
