import React from 'react';
import { Sidebar } from './Sidebar';
import { Topnav } from './Topnav';

export function Layout({ children, activeTab, setActiveTab }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-accent/30 selection:text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Topnav />
        
        {/* Main scrollable content area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar scroll-smooth">
          <div className="max-w-[1600px] mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
