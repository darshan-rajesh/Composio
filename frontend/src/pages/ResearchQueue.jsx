import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { api } from '../api';
import { cn } from '../utils/cn';

export function ResearchQueue() {
  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getApps().then(res => {
      setApps(res.data);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  const filteredApps = apps.filter(app => 
    app.app_name.toLowerCase().includes(search.toLowerCase()) || 
    (app.category && app.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Research Queue</h1>
          <p className="text-text-secondary mt-1">Manage and inspect automated SaaS analysis results.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-surface-border text-sm font-medium hover:bg-surface-hover hover:text-text-primary transition-colors">
            <Filter size={16} />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors shadow-glow">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
            <input 
              type="text" 
              placeholder="Search applications..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-surface-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
            />
          </div>
          <div className="text-sm text-text-secondary">
            Showing {filteredApps.length} of {apps.length} items
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface border-b border-surface-border text-text-secondary font-medium">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:text-text-primary transition-colors">
                  <div className="flex items-center gap-2">Application <ArrowUpDown size={14} /></div>
                </th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Auth Protocol</th>
                <th className="px-6 py-4">API Standard</th>
                <th className="px-6 py-4">MCP Status</th>
                <th className="px-6 py-4">Confidence</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-text-primary">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-text-tertiary">
                    Loading research data...
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-text-tertiary">
                    No matching applications found.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={app.id} 
                    className="hover:bg-surface-hover/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-text-primary">{app.app_name}</div>
                      <div className="text-xs text-text-tertiary truncate max-w-[200px] mt-0.5">{app.website}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-surface border border-surface-border text-xs text-text-secondary">
                        {app.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {app.auth_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-text-secondary">
                      {app.api_type}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border",
                        app.mcp_readiness_status === 'Official MCP' ? "bg-status-success/10 text-status-success border-status-success/20" :
                        app.mcp_readiness_status === 'Community MCP' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                        app.mcp_readiness_status === 'Planned' ? "bg-status-warning/10 text-status-warning border-status-warning/20" :
                        "bg-surface border-surface-border text-text-tertiary"
                      )}>
                        {app.mcp_readiness_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-1.5 bg-surface-border rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              app.confidence_score >= 80 ? "bg-status-success" :
                              app.confidence_score >= 60 ? "bg-status-warning" : "bg-status-danger"
                            )}
                            style={{ width: `${app.confidence_score}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-text-secondary">{app.confidence_score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
