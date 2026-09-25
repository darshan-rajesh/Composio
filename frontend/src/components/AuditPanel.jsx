import React, { useState } from 'react';

export function AuditPanel({ sampleApps, onSubmitAudit, auditMetrics }) {
  const [selectedAppIndex, setSelectedAppIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [correctedAuth, setCorrectedAuth] = useState('');
  const [status, setStatus] = useState('VERIFIED');

  if (!sampleApps || sampleApps.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        No audit sample available. Click "Generate Audit Sample" to begin.
      </div>
    );
  }

  const currentApp = sampleApps[selectedAppIndex];

  const handleAudit = (auditResult) => {
    onSubmitAudit(currentApp.id, {
      audit_status: auditResult,
      notes: notes,
      corrected_auth: correctedAuth || currentApp.auth_type
    });
    if (selectedAppIndex < sampleApps.length - 1) {
      setSelectedAppIndex(prev => prev + 1);
      setNotes('');
      setCorrectedAuth('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Sample List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-slate-200 mb-3 uppercase tracking-wider">Audit Queue ({sampleApps.length})</h4>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {sampleApps.map((app, index) => (
            <div 
              key={app.id} 
              onClick={() => setSelectedAppIndex(index)}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                index === selectedAppIndex 
                  ? 'bg-indigo-950/60 border-indigo-500 text-white' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between font-semibold text-sm">
                <span>{app.app_name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${
                  app.audit_status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  app.audit_status === 'FLAGGED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {app.audit_status || 'PENDING'}
                </span>
              </div>
              <div className="mt-1 text-slate-400 truncate">{app.one_line_description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Center/Right Column: Audit Workspace */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Auditing: {currentApp.app_name}</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">Category</span>
            <p className="text-sm font-medium text-slate-200 mt-1">{currentApp.category}</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">Current Auth Method</span>
            <p className="text-sm font-medium text-slate-200 mt-1">{currentApp.auth_type}</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">MCP Readiness</span>
            <p className="text-sm font-medium text-slate-200 mt-1">{currentApp.mcp_readiness_status}</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">Confidence Score</span>
            <p className="text-sm font-medium text-slate-200 mt-1">{currentApp.confidence_score}%</p>
          </div>
        </div>

        {/* Verification rationale */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-6">
          <span className="text-xs text-slate-400 uppercase font-semibold">AI Verification Rationale</span>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {currentApp.verification_rationale || "No detailed rationale provided by agent."}
          </p>
        </div>

        {/* Human Audit Controls */}
        <div className="border-t border-slate-800 pt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Audit Notes / Hallucination Flag</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add review notes, cite discrepancies or confirm accuracy..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg p-3 h-20 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => handleAudit('VERIFIED')}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg text-xs transition"
            >
              ✅ Confirm Accurate
            </button>
            <button 
              onClick={() => handleAudit('FLAGGED')}
              className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 rounded-lg text-xs transition"
            >
              🚩 Flag Discrepancy
            </button>
            <button 
              onClick={() => handleAudit('CORRECTED')}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2.5 rounded-lg text-xs transition"
            >
              ✏️ Correct Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
