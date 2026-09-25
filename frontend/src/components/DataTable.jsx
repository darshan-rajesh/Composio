import React, { useState } from 'react';

export function DataTable({ apps, onSelectApp }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [mcpFilter, setMcpFilter] = useState('All');

  if (!apps || apps.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        No application data loaded yet. Run the research pipeline to populate records.
      </div>
    );
  }

  const categories = ['All', ...new Set(apps.map(a => a.category).filter(Boolean))];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.app_name.toLowerCase().includes(search.toLowerCase()) ||
                          app.one_line_description?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || app.category === categoryFilter;
    const matchesMcp = mcpFilter === 'All' || 
                       (mcpFilter === 'Yes' && app.mcp_readiness_status !== 'None') ||
                       (mcpFilter === 'No' && app.mcp_readiness_status === 'None');

    return matchesSearch && matchesCat && matchesMcp;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Controls Header */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <input 
          type="text" 
          placeholder="Search SaaS applications..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-slate-100 text-sm rounded-lg px-4 py-2 w-64 focus:outline-none focus:border-indigo-500"
        />

        <div className="flex gap-3">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none"
          >
            {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
          </select>

          <select 
            value={mcpFilter}
            onChange={(e) => setMcpFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="All">MCP: All</option>
            <option value="Yes">MCP Ready / Planned</option>
            <option value="No">No MCP Support</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="p-3">App Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Auth Type</th>
              <th className="p-3">API Spec</th>
              <th className="p-3">MCP Status</th>
              <th className="p-3">Confidence</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredApps.map((app) => (
              <tr key={app.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-3 font-semibold text-white">
                  {app.app_name}
                  <div className="text-[10px] font-normal text-slate-400 truncate max-w-xs">{app.one_line_description}</div>
                </td>
                <td className="p-3 text-slate-400">{app.category || 'N/A'}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {app.auth_type || 'Unknown'}
                  </span>
                </td>
                <td className="p-3">{app.api_type || 'REST'}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-semibold ${
                    app.mcp_readiness_status === 'Official MCP' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    app.mcp_readiness_status === 'Community MCP' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                    app.mcp_readiness_status === 'Planned' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {app.mcp_readiness_status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full ${
                          app.confidence_score >= 80 ? 'bg-emerald-500' :
                          app.confidence_score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${app.confidence_score}%` }}
                      ></div>
                    </div>
                    <span className="font-mono text-slate-400">{app.confidence_score}%</span>
                  </div>
                </td>
                <td className="p-3">
                  <button 
                    onClick={() => onSelectApp(app)}
                    className="px-2.5 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded transition"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
