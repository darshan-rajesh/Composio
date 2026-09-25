import React from 'react';

export function ProgressTracker({ progress, onStart, isRunning }) {
  const percent = progress && progress.total > 0 
    ? Math.round((progress.completed / progress.total) * 100) 
    : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Autonomous Research Engine</h3>
          <p className="text-xs text-slate-400">Multi-agent crawler with Tavily Web Search & OpenAI Verification</p>
        </div>

        <button
          onClick={onStart}
          disabled={isRunning}
          className={`px-5 py-2.5 rounded-lg text-xs font-semibold shadow-md transition-all ${
            isRunning 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'
          }`}
        >
          {isRunning ? 'Pipeline Running...' : '🚀 Start Pipeline Run'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-300">
          <span>Status: {progress?.status || 'Idle'}</span>
          <span>{progress?.completed || 0} / {progress?.total || 100} Apps ({percent}%)</span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
          <div 
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
