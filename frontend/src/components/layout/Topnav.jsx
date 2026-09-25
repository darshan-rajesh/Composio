import React from 'react';
import { Search, Bell, Activity, PlayCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Topnav() {
  return (
    <header className="h-16 border-b border-surface-border bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6">
      
      {/* Search Bar */}
      <div className="flex items-center gap-2 max-w-md w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
          <input 
            type="text" 
            placeholder="Search applications, logs, or metrics... (Cmd+K)" 
            className="w-full bg-surface border border-surface-border rounded-lg pl-10 pr-4 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        
        {/* Status Indicators */}
        <div className="flex items-center gap-4 text-xs font-medium border-r border-surface-border pr-6">
          <div className="flex items-center gap-1.5 text-status-success">
            <Activity size={14} />
            <span>API: Optimal</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary cursor-pointer transition-colors">
            <PlayCircle size={14} className="text-accent" />
            <span>Pipeline Idle</span>
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-full transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)] border-2 border-background"></span>
          </button>
          
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-orange-400 p-[2px] cursor-pointer shadow-glow">
            <div className="w-full h-full bg-background rounded-full border border-background flex items-center justify-center overflow-hidden">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=transparent" alt="User avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
