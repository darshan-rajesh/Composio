import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

export function StatCard({ title, value, label, trend, trendValue, icon: Icon, colorClass, index }) {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';
  const isNeutral = trend === 'neutral';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="glass-card rounded-2xl p-6 group cursor-default relative overflow-hidden"
    >
      {/* Subtle background glow effect on hover */}
      <div className={cn(
        "absolute -inset-px opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl blur-md",
        colorClass
      )} />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-text-secondary tracking-wide uppercase">{title}</p>
          <div className={cn("p-2.5 rounded-xl bg-surface-border/50 text-text-secondary group-hover:text-text-primary transition-colors duration-300", colorClass.replace('bg-', 'group-hover:bg-').replace('text-', ''))}>
            <Icon size={18} />
          </div>
        </div>
        
        <div>
          <motion.h3 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl font-semibold text-text-primary tracking-tight"
          >
            {value}
          </motion.h3>
          <div className="flex items-center gap-2 mt-2">
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md",
              isPositive ? "bg-status-success/10 text-status-success" : 
              isNegative ? "bg-status-danger/10 text-status-danger" : 
              "bg-surface-border text-text-secondary"
            )}>
              {isPositive && <TrendingUp size={12} />}
              {isNegative && <TrendingDown size={12} />}
              {isNeutral && <Minus size={12} />}
              {trendValue}
            </div>
            <p className="text-xs text-text-tertiary">{label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
