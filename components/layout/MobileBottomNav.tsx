import React from 'react';
import { Box, Palette, Target, MessageSquare } from 'lucide-react';
import { cn } from '../../utils/cn';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface MobileBottomNavProps {
    items: NavItem[];
    activeTab: string;
    onTabSelect: (id: string) => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ items, activeTab, onTabSelect }) => {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-neutral-950 border-t border-white/10 flex items-center justify-around px-2 z-50 pb-safe">
            {items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onTabSelect(item.id)}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 p-2 w-16 transition-all active:scale-95",
                            isActive ? "text-emerald-400" : "text-neutral-500 hover:text-neutral-300"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-full transition-colors",
                            isActive && "bg-emerald-500/10"
                        )}>
                            {item.icon}
                        </div>
                        <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default MobileBottomNav;
