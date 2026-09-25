import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { AuditPanel } from '../components/AuditPanel';

export function Audit() {
  const [sampleApps, setSampleApps] = useState([]);
  const [metrics, setMetrics] = useState(null);

  const fetchSample = async () => {
    try {
      const res = await api.getAuditSample(15);
      setSampleApps(res.data);
      const metricsRes = await api.getAuditMetrics();
      setMetrics(metricsRes.data);
    } catch (err) {
      console.error('Failed to fetch audit sample:', err);
    }
  };

  useEffect(() => {
    fetchSample();
  }, []);

  const handleSubmitAudit = async (appId, auditData) => {
    try {
      await api.submitAudit(appId, auditData);
      fetchSample();
    } catch (err) {
      console.error('Failed to submit audit:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white">Human Audit & Trust Workflow</h2>
          <p className="text-xs text-slate-400 mt-1">
            Validate AI agent accuracy, flag hallucinations, and generate trustworthiness benchmarks.
          </p>
        </div>

        <button 
          onClick={fetchSample}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
        >
          🔄 Refresh Sample
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase">Pre-Audit Accuracy</span>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{metrics.pre_audit_accuracy}%</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase">Post-Audit Verified</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{metrics.post_audit_accuracy}%</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase">Hallucinations Flagged</span>
            <p className="text-2xl font-bold text-rose-400 mt-1">{metrics.flagged_count}</p>
          </div>
        </div>
      )}

      <AuditPanel 
        sampleApps={sampleApps} 
        onSubmitAudit={handleSubmitAudit} 
        auditMetrics={metrics} 
      />
    </div>
  );
}
