'use client';

import React from 'react';
import { C } from '@/lib/theme';

interface InpProps {
    label?: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (val: string) => void;
    icon?: string;
    multiline?: boolean;
    rows?: number;
    style?: React.CSSProperties;
    disabled?: boolean;
    name?: string;
}

export default function Inp({ label, type = 'text', placeholder, value, onChange, icon, multiline, rows = 3, style: extraStyle, disabled, name }: InpProps) {
    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px 14px',
        paddingLeft: icon ? 40 : 14,
        border: `1.5px solid ${C.inputBorder}`,
        borderRadius: 12,
        fontSize: 14,
        background: C.inputBg,
        color: C.greenDeep,
        ...extraStyle,
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {label && <label style={{ fontSize: 13, fontWeight: 500, color: C.greenDeep }}>{label}</label>}
            <div style={{ position: 'relative', display: 'flex', alignItems: multiline ? 'flex-start' : 'center' }}>
                {icon && <span style={{ position: 'absolute', left: 12, top: multiline ? 13 : undefined, fontSize: 16, pointerEvents: 'none', zIndex: 1 }}>{icon}</span>}
                {multiline ? (
                    <textarea
                        rows={rows}
                        placeholder={placeholder}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        disabled={disabled}
                        name={name}
                        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                    />
                ) : (
                    <input
                        type={type}
                        placeholder={placeholder}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        disabled={disabled}
                        name={name}
                        style={inputStyle}
                    />
                )}
            </div>
        </div>
    );
}
