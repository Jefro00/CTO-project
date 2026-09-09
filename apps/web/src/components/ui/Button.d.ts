import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}
export declare const Button: React.FC<ButtonProps>;
export {};
