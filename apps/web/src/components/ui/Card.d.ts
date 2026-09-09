import React from 'react';
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    action?: React.ReactNode;
    headerBorder?: boolean;
}
export declare const Card: React.FC<CardProps>;
export {};
