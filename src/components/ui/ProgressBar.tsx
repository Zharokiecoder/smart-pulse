import React from 'react';

interface ProgressBarProps {
    value: number;
    max?: number;
    color?: string;
    height?: number;
}

export default function ProgressBar({ value, max = 100, color = '#4A7C59', height = 8 }: ProgressBarProps) {
    return (
        <div style={{ height, background: `${color}20`, borderRadius: height / 2, overflow: 'hidden' }}>
            <div style={{
                height: '100%',
                width: `${(value / max) * 100}%`,
                background: color,
                borderRadius: height / 2,
                transition: 'width .5s ease',
            }} />
        </div>
    );
}
