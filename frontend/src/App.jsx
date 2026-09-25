import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CaseStudy } from './pages/CaseStudy';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { ResearchQueue } from './pages/ResearchQueue';
import { Analytics } from './pages/Analytics';
import { X, LayoutDashboard } from 'lucide-react';

const Placeholder = ({ title }) => (
  <div className="flex h-full items-center justify-center text-zinc-500">
    <h2 className="text-xl font-semibold">{title} (Coming Soon)</h2>
  </div>
);

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AnimatePresence mode="wait">
      {!showDashboard ? (
        <motion.div
          key="casestudy"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CaseStudy onOpenDashboard={() => setShowDashboard(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Back to case study button */}
          <button
            onClick={() => setShowDashboard(false)}
            className="fixed top-4 right-4 z-[9999] inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700 text-white text-xs font-medium px-3 py-2 rounded-xl hover:bg-zinc-800 transition-colors shadow-lg"
          >
            <X size={13} />
            Back to Case Study
          </button>

          <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'research' && <ResearchQueue />}
            {activeTab === 'verification' && <Placeholder title="Verification Center" />}
            {activeTab === 'audit' && <Placeholder title="Audit Center" />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'reports' && <Placeholder title="Executive Reports" />}
            {activeTab === 'export' && <Placeholder title="Export System" />}
            {activeTab === 'settings' && <Placeholder title="System Settings" />}
          </Layout>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
