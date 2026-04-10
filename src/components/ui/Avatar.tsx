import React from 'react';

interface AvatarProps {
    name?: string;
    size?: number;
    bg?: string;
}

export default function Avatar({ name = '?', size = 36, bg = '#4A7C59' }: AvatarProps) {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: bg,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.38,
            fontWeight: 600,
            flexShrink: 0,
        }}>
            {initials}
        </div>
    );
}
