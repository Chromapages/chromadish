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
    <div className="flex h-screen w-full flex-col bg-neutral-950 text-neutral-50 overflow-hidden">
      {topBar && (
        <header className="h-14 border-b border-white/10 flex items-center px-4 md:px-6 shrink-0 bg-neutral-950/50 backdrop-blur-md z-30">
          {topBar}
        </header>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-80 border-r border-white/10 flex-col bg-neutral-950 shrink-0 z-20">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {sidebar}
          </div>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 relative overflow-hidden bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] flex flex-col items-center justify-center">
          {/* On mobile, add padding bottom to account for nav */}
          <div className="w-full h-full flex flex-col items-center justify-center p-4 pb-24 md:p-8 md:pb-8 overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-5xl flex-1 flex flex-col items-center justify-center min-h-[300px]">
              {canvas}
            </div>
          </div>

          {/* Action Bar */}
          <div className="absolute bottom-[calc(4rem+1.5rem)] md:bottom-6 left-0 right-0 px-4 flex justify-center z-30 pointer-events-none">
            <div className="w-full max-w-2xl pointer-events-auto">
              {actionBar}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Elements */}
      {mobileNav}
      {bottomSheet}
    </div>
  );
};

export default AppShell;
