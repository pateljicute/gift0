import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md';
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', size = 'md', className = '' }) => {
    const variantClasses = {
        primary: 'badge-primary',
        success: 'badge-success',
        warning: 'badge-warning',
        error: 'bg-red-500/20 text-red-300 border border-red-500/30',
    };

    const sizeClasses = {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-2.5 py-0.5',
    };

    return (
        <span className={`badge ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
