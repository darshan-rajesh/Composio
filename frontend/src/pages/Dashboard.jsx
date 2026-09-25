import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, ShieldCheck, CheckCircle2, UserCheck, Zap } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { PipelineFlow } from '../components/dashboard/PipelineFlow';
import { api } from '../api';

export function Dashboard() {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    const fetchOverview = () => {
      api.getOverview().then(res => setOverview(res.data)).catch(console.error);
    };

    fetchOverview();
    const interval = setInterval(fetchOverview, 3000);
    return () => clearInterval(interval);
  }, []);

  const kpis = [
    {
      title: "Total Apps",
      value: overview?.total_apps ?? 0,
      label: "Target ecosystem size",
      trend: "neutral",
      trendValue: "0%",
      icon: Layers,
      colorClass: "bg-blue-500/20 text-blue-400"
    },
    {
      title: "Researched",
      value: overview?.completed_count ?? 0,
      label: "Completed processing",
      trend: "up",
      trendValue: overview ? `${Math.round(((overview.completed_count || 0) / (overview.total_apps || 1)) * 100)}%` : "0%",
      icon: Zap,
      colorClass: "bg-accent/20 text-accent"
    },
    {
      title: "Verified",
      value: overview?.verified_count ?? 0,
      label: "Cross-checked by Agent",
      trend: "up",
      trendValue: overview ? `${Math.round(((overview.verified_count || 0) / (overview.total_apps || 1)) * 100)}%` : "0%",
      icon: ShieldCheck,
      colorClass: "bg-purple-500/20 text-purple-400"
    },
    {
      title: "Avg Confidence",
      value: `${overview?.avg_confidence ?? 0}%`,
      label: "System-wide trust score",
      trend: "up",
      trendValue: overview ? `${overview.high_confidence_count ?? 0} High` : "0 High",
      icon: CheckCircle2,
      colorClass: "bg-status-success/20 text-status-success"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Analytics Overview</h1>
        <p className="text-text-secondary mt-1">Real-time metrics from the autonomous SaaS research engine.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <StatCard key={kpi.title} {...kpi} index={idx} />
        ))}
      </div>

      {/* Pipeline Architecture */}
      <PipelineFlow />

      {/* Placeholder for Advanced Analytics section that previously existed. 
          We'll build a dedicated Analytics page for the charts instead. */}
      <div className="glass-card rounded-3xl p-8 flex items-center justify-center h-64 border-dashed border-2 border-surface-border">
        <div className="text-center">
          <BarChart3 size={32} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-text-secondary font-medium">Detailed visualizations moved to Analytics tab</p>
        </div>
      </div>
    </motion.div>
  );
}

// Ensure icon is imported
import { BarChart3 } from 'lucide-react';
