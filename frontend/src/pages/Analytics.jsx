import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { api } from '../api';

const COLORS = ['#F59E0B', '#3B82F6', '#22C55E', '#A855F7', '#EF4444'];

export function Analytics() {
  const [data, setData] = useState({
    authTypes: [],
    apiTypes: [],
    mcpStatus: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // We'll mock the aggregation since the backend might not have dedicated aggregation endpoints yet
    // Ideally, we'd fetch all apps or an aggregation endpoint.
    api.getApps().then(res => {
      const apps = res.data;
      
      const authCounts = apps.reduce((acc, app) => {
        acc[app.auth_type] = (acc[app.auth_type] || 0) + 1;
        return acc;
      }, {});

      const apiCounts = apps.reduce((acc, app) => {
        acc[app.api_type] = (acc[app.api_type] || 0) + 1;
        return acc;
      }, {});
      
      const mcpCounts = apps.reduce((acc, app) => {
        acc[app.mcp_readiness_status] = (acc[app.mcp_readiness_status] || 0) + 1;
        return acc;
      }, {});

      setData({
        authTypes: Object.keys(authCounts).map(k => ({ name: k || 'Unknown', value: authCounts[k] })),
        apiTypes: Object.keys(apiCounts).map(k => ({ name: k || 'Unknown', value: apiCounts[k] })),
        mcpStatus: Object.keys(mcpCounts).map(k => ({ name: k || 'Unknown', value: mcpCounts[k] }))
      });
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-surface-border p-3 rounded-lg shadow-glass">
          <p className="text-text-primary font-medium">{payload[0].name || label}</p>
          <p className="text-accent text-sm">{`Count: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Ecosystem Analytics</h1>
        <p className="text-text-secondary mt-1">Deep-dive visualizations of SaaS protocols and standards.</p>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-text-tertiary">
          Loading analytics data...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Auth Types Bar Chart */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-6">Authentication Protocols</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.authTypes} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#A1A1AA" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#1D1D20'}} />
                  <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* API Types Pie Chart */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-6">API Architectures</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.apiTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.apiTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-text-secondary text-sm">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MCP Readiness Bar Chart */}
          <div className="glass-card rounded-3xl p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-text-primary mb-6">MCP Readiness Status</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.mcpStatus} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                  <XAxis dataKey="name" stroke="#A1A1AA" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#1D1D20'}} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40}>
                    {data.mcpStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </motion.div>
  );
}
