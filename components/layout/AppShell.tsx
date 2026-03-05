import React from 'react';
import { cn } from '../../utils/cn';

interface AppShellProps {
  sidebar: React.ReactNode;
  canvas: React.ReactNode;
  actionBar: React.ReactNode;
  topBar?: React.ReactNode;
  mobileNav?: React.ReactNode;
  bottomSheet?: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ sidebar, canvas, actionBar, topBar, mobileNav, bottomSheet }) => {
  return (
    <div className="flex h-screen w-full flex-col bg-neutral-950 text-neutral-50 overflow-hidden font-sans">
      {topBar && (
        <header className="h-14 border-b border-white/5 flex items-center px-4 md:px-6 shrink-0 bg-neutral-950/80 backdrop-blur-xl z-30">
          {topBar}
        </header>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Canvas Area (Left Side) */}
        <main className="flex-1 relative overflow-hidden bg-tech-pattern flex flex-col items-center justify-center">
          {/* On mobile, add padding bottom to account for nav */}
          <div className="w-full h-full flex flex-col items-center justify-center p-4 pb-24 md:p-8 md:pb-8 overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-5xl flex-1 flex flex-col items-center justify-center min-h-[300px]">
              {canvas}
            </div>
          </div>

          {/* Action Bar */}
          <div className="absolute bottom-[calc(4rem+1.5rem)] md:bottom-8 left-0 right-0 px-4 flex justify-center z-30 pointer-events-none">
            <div className="w-full max-w-2xl pointer-events-auto">
              {actionBar}
            </div>
          </div>
        </main>

        {/* Desktop Sidebar (Right Side) */}
        <aside className="hidden md:flex w-80 lg:w-96 border-l border-white/5 flex-col bg-neutral-900/30 shrink-0 z-20 shadow-2xl">
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            {sidebar}
          </div>
        </aside>
      </div>

      {/* Mobile Elements */}
      {mobileNav}
      {bottomSheet}
    </div>
  );
};

export default AppShell;
