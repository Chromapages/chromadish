import React from 'react';
import { cn } from '../../utils/cn';

interface SidebarSectionProps {
    title: string;
    children: React.ReactNode;
    description?: string;
    className?: string;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children, description, className }) => {
    return (
        <div className={cn("rounded-2xl bg-neutral-900 ring-1 ring-white/10 p-4 space-y-3", className)}>
            <div className="space-y-1">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{title}</h3>
                {description && <p className="text-[10px] text-neutral-500 font-medium leading-tight">{description}</p>}
            </div>
            <div className="pt-1">
                {children}
            </div>
        </div>
    );
};

export default SidebarSection;
