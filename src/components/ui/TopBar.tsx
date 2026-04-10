import React from 'react';
import { C } from '@/lib/theme';

interface TopBarProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
    return (
        <div className="topbar-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: C.greenDeep }}>{title}</h1>
                {subtitle && <p style={{ fontSize: 14, color: C.textMuted, marginTop: 2 }}>{subtitle}</p>}
            </div>
            {actions && <div style={{ display: 'flex', gap: 10 }}>{actions}</div>}
        </div>
    );
}
