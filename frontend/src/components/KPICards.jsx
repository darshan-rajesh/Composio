import React from 'react';

export function KPICards({ metrics }) {
  if (!metrics) return null;

  const cards = [
    {
      title: 'Total Applications',
      value: metrics.total_apps || 0,
      subtext: 'Targeted in study',
      icon: '📱',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      title: 'Research Completed',
      value: `${metrics.completed_count || 0} / ${metrics.total_apps || 0}`,
      subtext: `${Math.round(((metrics.completed_count || 0) / (metrics.total_apps || 1)) * 100)}% coverage`,
      icon: '⚡',
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Avg Confidence',
      value: `${Math.round(metrics.avg_confidence || 0)}%`,
      subtext: 'Multi-agent verified score',
      icon: '🛡️',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      title: 'MCP Adoption',
      value: `${metrics.mcp_readiness_pct || 0}%`,
      subtext: 'Built/planned integration',
      icon: '🔌',
      color: 'from-amber-600 to-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-lg hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.title}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{card.value}</h3>
              <p className="text-xs text-slate-400 mt-1">{card.subtext}</p>
            </div>
            <div className={`text-2xl p-3 rounded-lg bg-gradient-to-br ${card.color} bg-opacity-20`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
