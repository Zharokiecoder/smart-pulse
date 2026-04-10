'use client';

import React from 'react';
import { C } from '@/lib/theme';

interface BtnProps {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    full?: boolean;
    style?: React.CSSProperties;
    type?: 'button' | 'submit';
    disabled?: boolean;
}

export default function Btn({ children, onClick, variant = 'primary', size = 'md', full, style: ext, type = 'button', disabled }: BtnProps) {
    const base: React.CSSProperties = {
        border: 'none',
        borderRadius: 12,
        fontFamily: "'DM Sans', sans-serif",
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: 'filter .15s ease, transform .1s ease',
        fontWeight: 500,
        opacity: disabled ? 0.5 : 1,
    };
    const sizes: Record<string, React.CSSProperties> = {
        sm: { padding: '8px 16px', fontSize: 13 },
        md: { padding: '12px 22px', fontSize: 15 },
        lg: { padding: '15px 28px', fontSize: 16 },
    };
    const variants: Record<string, React.CSSProperties> = {
        primary: { background: C.greenForest, color: '#fff', boxShadow: `0 4px 18px ${C.greenForest}35` },
        secondary: { background: C.creamDark, color: C.greenDeep },
        outline: { background: 'transparent', color: C.greenForest, border: `2px solid ${C.greenForest}50` },
        danger: { background: C.dangerBg, color: C.danger, border: `1.5px solid ${C.danger}30` },
        ghost: { background: 'transparent', color: C.textMuted },
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{ ...base, ...sizes[size], ...variants[variant], width: full ? '100%' : undefined, ...ext }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.92)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
        >
            {children}
        </button>
    );
}
