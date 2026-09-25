import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileUp, Bot, ShieldCheck, UserCheck, BarChart3, DownloadCloud } from 'lucide-react';
import { api } from '../../api';
import { cn } from '../../utils/cn';

const stages = [
  { id: 'import', label: 'CSV Import', icon: FileUp, status: 'complete' },
  { id: 'research', label: 'Research Agent', icon: Bot, status: 'active' },
  { id: 'verify', label: 'Verification Agent', icon: ShieldCheck, status: 'pending' },
  { id: 'audit', label: 'Audit Layer', icon: UserCheck, status: 'pending' },
  { id: 'analytics', label: 'Analytics Engine', icon: BarChart3, status: 'pending' },
  { id: 'export', label: 'Export System', icon: DownloadCloud, status: 'pending' },
];

export function PipelineFlow() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = () => {
      api.getResearchProgress().then(res => setStatus(res.data)).catch(console.error);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const phase = status?.phase || 'idle';
  const isRunning = phase === 'researching' || phase === 'verifying';

  const stages = [
    { id: 'import', label: 'CSV Import', icon: FileUp, status: (status?.total_apps || 0) > 0 ? 'complete' : 'pending' },
    { id: 'research', label: 'Research Agent', icon: Bot, status: phase === 'researching' ? 'active' : (status?.researched || 0) > 0 ? 'complete' : 'pending' },
    { id: 'verify', label: 'Verification Agent', icon: ShieldCheck, status: phase === 'verifying' ? 'active' : (status?.verified || 0) > 0 ? 'complete' : 'pending' },
    { id: 'audit', label: 'Audit Layer', icon: UserCheck, status: (status?.audited || 0) > 0 ? 'complete' : 'pending' },
    { id: 'analytics', label: 'Analytics Engine', icon: BarChart3, status: (status?.researched || 0) > 0 ? 'complete' : 'pending' },
    { id: 'export', label: 'Export System', icon: DownloadCloud, status: phase === 'complete' ? 'complete' : 'pending' },
  ];

  return (
    <div className="glass-card rounded-3xl p-8 mb-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">System Architecture Flow</h2>
          <p className="text-sm text-text-secondary mt-1">Real-time status of the multi-agent research pipeline.</p>
        </div>
        <div className={cn(
          "flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
          isRunning ? "bg-accent/10 text-accent border-accent/20" : "bg-surface border-surface-border text-text-tertiary"
        )}>
          <span className="relative flex h-2 w-2">
            {isRunning && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>}
            <span className={cn("relative inline-flex rounded-full h-2 w-2", isRunning ? "bg-accent" : "bg-text-tertiary")}></span>
          </span>
          {isRunning ? `Pipeline Active (${status?.current_app || 'Processing'})` : `Pipeline ${phase.toUpperCase()}`}
        </div>
      </div>

      <div className="relative flex items-center justify-between w-full mt-4">
        {/* Connecting Lines */}
        <div className="absolute left-[5%] right-[5%] top-1/2 -translate-y-1/2 h-[2px] bg-surface-border -z-10" />
        
        {/* Animated Progress Line */}
        <motion.div 
          className="absolute left-[5%] top-1/2 -translate-y-1/2 h-[2px] bg-accent -z-10"
          initial={{ width: '0%' }}
          animate={{ width: '30%' }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isComplete = stage.status === 'complete';
          const isActive = stage.status === 'active';
          
          return (
            <div key={stage.id} className="flex flex-col items-center gap-3 relative group">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 relative z-10",
                  isComplete ? "bg-status-success/10 border-status-success/30 text-status-success" :
                  isActive ? "bg-accent/20 border-accent/50 text-accent shadow-[0_0_20px_rgba(245,158,11,0.2)]" :
                  "bg-surface border-surface-border text-text-tertiary"
                )}
              >
                <Icon size={20} />
                {isActive && (
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="absolute -inset-1 border-2 border-transparent border-t-accent/50 rounded-2xl"
                  />
                )}
              </motion.div>
              
              <div className="text-center absolute top-16 w-32 -ml-10">
                <p className={cn(
                  "text-xs font-semibold whitespace-nowrap",
                  isActive ? "text-text-primary" : "text-text-secondary"
                )}>{stage.label}</p>
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider mt-0.5">
                  {isComplete ? 'Done' : isActive ? 'Processing' : 'Waiting'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Spacer to account for absolute positioned text */}
      <div className="h-12"></div>
    </div>
  );
}
