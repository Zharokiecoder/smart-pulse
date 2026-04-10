import React from 'react';
import { C } from '@/lib/theme';

interface CardProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
    onClick?: () => void;
    className?: string;
}

export default function Card({ children, style: ext, onClick, className }: CardProps) {
    return (
        <div
            className={className}
            onClick={onClick}
            style={{
                background: C.creamCard,
                borderRadius: 20,
                padding: 20,
                boxShadow: '0 2px 16px #00000009',
                border: `1px solid ${C.creamDark}`,
                ...ext,
            }}
        >
            {children}
        </div>
    );
}

