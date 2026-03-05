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
        <div className={cn("rounded-2xl surface-panel p-5 space-y-4", className)}>
            <div className="space-y-1.5">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">{title}</h3>
                {description && <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">{description}</p>}
            </div>
            <div className="pt-2">
                {children}
            </div>
        </div>
    );
};

export default SidebarSection;
