import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar
} from 'recharts';
import { Section, SectionLabel, SectionTitle, FadeIn } from './Primitives';

const authData = [
  { name: 'OAuth2', value: 68 },
  { name: 'API Key', value: 21 },
  { name: 'SAML/SSO', value: 6 },
  { name: 'Basic Auth', value: 3 },
  { name: 'JWT', value: 2 },
];

const apiData = [
  { name: 'REST', value: 82 },
  { name: 'GraphQL', value: 9 },
  { name: 'WebSocket', value: 5 },
  { name: 'gRPC', value: 4 },
];

const accessData = [
  { name: 'Self-Serve', value: 57, fill: '#22C55E' },
  { name: 'Enterprise-Gated', value: 43, fill: '#EF4444' },
];

const buildData = [
  { name: 'High', value: 38, fill: '#22C55E' },
  { name: 'Medium', value: 44, fill: '#F59E0B' },
  { name: 'Low', value: 18, fill: '#EF4444' },
];

const categoryData = [
  { name: 'DevTools', apps: 14 },
  { name: 'CRM', apps: 12 },
  { name: 'Productivity', apps: 11 },
  { name: 'Analytics', apps: 10 },
  { name: 'Infrastructure', apps: 10 },
  { name: 'E-Commerce', apps: 9 },
  { name: 'HR', apps: 9 },
  { name: 'Finance', apps: 9 },
  { name: 'Marketing', apps: 8 },
  { name: 'Security', apps: 8 },
];

const PIE_COLORS = ['#F59E0B', '#3B82F6', '#A855F7', '#10B981', '#EF4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 shadow-card-lg text-sm">
        <p className="text-zinc-400 mb-1">{payload[0].name || label}</p>
        <p className="text-white font-semibold">{payload[0].value}{payload[0].name ? '%' : ' apps'}</p>
      </div>
    );
  }
  return null;
};

const ChartCard = ({ title, children }) => (
  <div className="glass border-subtle rounded-3xl p-7">
    <h3 className="text-base font-semibold text-white mb-6">{title}</h3>
    {children}
  </div>
);

export function PatternAnalysis() {
  return (
    <Section id="analysis" className="bg-bg-primary">
      <FadeIn>
        <SectionLabel>Pattern Analysis</SectionLabel>
        <SectionTitle sub="Visual breakdowns of the major patterns and distributions across 100 researched SaaS applications.">
          Ecosystem Distribution Charts
        </SectionTitle>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auth Bar Chart */}
        <FadeIn delay={0.05}>
          <ChartCard title="Authentication Protocol Distribution">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={authData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" horizontal={false} />
                  <XAxis type="number" stroke="#52525B" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                  <YAxis dataKey="name" type="category" stroke="#A1A1AA" fontSize={11} tickLine={false} axisLine={false} width={72} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </FadeIn>

        {/* API Types Donut */}
        <FadeIn delay={0.1}>
          <ChartCard title="API Architecture Surface">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={apiData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value" stroke="none">
                    {apiData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom" height={32} iconType="circle" iconSize={8}
                    formatter={(val) => <span className="text-zinc-400 text-xs">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </FadeIn>

        {/* Access Model Split */}
        <FadeIn delay={0.15}>
          <ChartCard title="Self-Serve vs. Enterprise-Gated Access">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={accessData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value" stroke="none">
                    {accessData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom" height={32} iconType="circle" iconSize={8}
                    formatter={(val) => <span className="text-zinc-400 text-xs">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </FadeIn>

        {/* Buildability */}
        <FadeIn delay={0.2}>
          <ChartCard title="Buildability Score Distribution">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={buildData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value" stroke="none">
                    {buildData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom" height={32} iconType="circle" iconSize={8}
                    formatter={(val) => <span className="text-zinc-400 text-xs">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </FadeIn>

        {/* Category breakdown - full width */}
        <FadeIn delay={0.25} className="md:col-span-2">
          <ChartCard title="Research Coverage by Category">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                  <XAxis dataKey="name" stroke="#A1A1AA" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525B" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="apps" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={28}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </FadeIn>
      </div>
    </Section>
  );
}
