import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    color?: string;
}

export default function Badge({ children, color = '#4A7C59' }: BadgeProps) {
    return (
        <span style={{
            padding: '3px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            background: `${color}18`,
            color,
            letterSpacing: '0.02em',
        }}>
            {children}
        </span>
    );
}
