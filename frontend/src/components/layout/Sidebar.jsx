import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  BarChart3, 
  FileText, 
  DownloadCloud, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'research', label: 'Research Queue', icon: Search },
  { id: 'verification', label: 'Verification', icon: ShieldCheck },
  { id: 'audit', label: 'Audit Center', icon: UserCheck },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'export', label: 'Exports', icon: DownloadCloud },
];

export function Sidebar({ activeTab, setActiveTab }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '260px' }}
      className="h-screen bg-background-subtle border-r border-surface-border flex flex-col relative z-20 shrink-0 transition-all duration-300"
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-surface border border-surface-border rounded-full p-1 text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-surface-border overflow-hidden">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            R
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.1 }}
              className="flex flex-col whitespace-nowrap"
            >
              <span className="text-sm font-bold text-amber-500 tracking-wide">RESEARCH ENGINE</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">SaaS Intelligence</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "text-accent bg-accent/5" 
                  : "text-text-secondary hover:text-text-primary hover:bg-surface"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute left-0 w-1 h-5 bg-accent rounded-r-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                />
              )}
              
              <Icon size={18} className={cn("shrink-0", isActive ? "text-accent" : "text-text-secondary group-hover:text-text-primary")} />
              
              {!isCollapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Settings */}
      <div className="p-4 border-t border-surface-border">
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group",
            activeTab === 'settings' 
              ? "text-accent bg-accent/5" 
              : "text-text-secondary hover:text-text-primary hover:bg-surface"
          )}
        >
          <Settings size={18} className="shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Settings</span>}
        </button>
      </div>
    </motion.aside>
  );
}
