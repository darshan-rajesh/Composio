import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
    },
    tooltip: {
      backgroundColor: '#0f172a',
      titleColor: '#f8fafc',
      bodyColor: '#cbd5e1',
      borderColor: '#334155',
      borderWidth: 1,
    }
  },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
    y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
  }
};

export function AuthDistributionChart({ data }) {
  if (!data) return null;
  
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: 'App Count',
        data: Object.values(data),
        backgroundColor: [
          '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
          '#10b981', '#06b6d4', '#3b82f6', '#64748b'
        ],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg h-80">
      <h4 className="text-sm font-semibold text-slate-200 mb-4">Authentication Protocols Distribution</h4>
      <div className="h-60">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export function McpStatsChart({ data }) {
  if (!data) return null;

  const chartData = {
    labels: ['Official MCP', 'Community MCP', 'Planned', 'None'],
    datasets: [
      {
        data: [
          data.official_mcp || 0,
          data.community_mcp || 0,
          data.planned || 0,
          data.none || 0,
        ],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#64748b'],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg h-80">
      <h4 className="text-sm font-semibold text-slate-200 mb-4">MCP (Model Context Protocol) Adoption</h4>
      <div className="h-60 flex justify-center">
        <Pie data={chartData} options={{ ...chartOptions, scales: {} }} />
      </div>
    </div>
  );
}

export function ConfidenceChart({ data }) {
  if (!data) return null;

  const chartData = {
    labels: ['90-100% (High)', '70-89% (Medium)', '50-69% (Low)', '<50% (Unverified)'],
    datasets: [
      {
        label: 'Apps Count',
        data: [
          data.high || 0,
          data.medium || 0,
          data.low || 0,
          data.unverified || 0,
        ],
        backgroundColor: '#6366f1',
        borderRadius: 6,
      }
    ]
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg h-80">
      <h4 className="text-sm font-semibold text-slate-200 mb-4">Confidence Score Distribution</h4>
      <div className="h-60">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
