import React from 'react';
interface BadgeProps {
    children: React.ReactNode;
    variant?: 'gray' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple';
    size?: 'sm' | 'md';
    className?: string;
}
export declare const Badge: React.FC<BadgeProps>;
export {};
