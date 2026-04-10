'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { C } from '@/lib/theme';
import Avatar from '@/components/ui/Avatar';

const NAV_DONOR = [
    { id: '/dashboard', icon: '📊', label: 'Dashboard' },
    { id: '/post', icon: '➕', label: 'Post Surplus' },
    { id: '/donations', icon: '📦', label: 'My Donations' },
    { id: '/pickups', icon: '🚚', label: 'Pickup Requests' },
    { id: '/messages', icon: '💬', label: 'Messages' },
    { id: '/notifications', icon: '🔔', label: 'Notifications' },
    { id: '/profile', icon: '👤', label: 'Profile' },
];

const NAV_NGO = [
    { id: '/ngo/dashboard', icon: '📊', label: 'Dashboard' },
    { id: '/browse', icon: '🔍', label: 'Browse Food' },
    { id: '/ngo/pickups', icon: '🚚', label: 'My Pickups' },
    { id: '/messages', icon: '💬', label: 'Messages' },
    { id: '/notifications', icon: '🔔', label: 'Notifications' },
    { id: '/reports', icon: '📈', label: 'Reports' },
    { id: '/profile', icon: '👤', label: 'Profile' },
];

interface SidebarProps {
    role: string;
    userName: string;
    unreadCount?: number;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ role, userName, unreadCount = 0, isOpen = false, onClose }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const nav = role === 'donor' ? NAV_DONOR : NAV_NGO;

    const handleNav = (path: string) => {
        router.push(path);
        onClose?.();
    };

    return (
        <div className={`dash-sidebar ${isOpen ? 'sidebar-open' : ''}`} style={{
            width: 220,
            minHeight: '100vh',
            background: C.greenDeep,
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 100,
        }}>
            <div style={{
                padding: '28px 20px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                borderBottom: '1px solid #ffffff12',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: `linear-gradient(135deg, ${C.greenForest}, ${C.greenLeaf})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                    }}>🍃</div>
                    <span style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#E8F0E3',
                    }}>FoodRescue</span>
                </div>
                {/* Close button for mobile */}
                {onClose && (
                    <button
                        className="sidebar-mobile-toggle"
                        onClick={onClose}
                        style={{
                            position: 'static',
                            width: 32,
                            height: 32,
                            fontSize: 18,
                            background: 'transparent',
                            boxShadow: 'none',
                            color: '#E8F0E3',
                        }}
                        aria-label="Close menu"
                    >✕</button>
                )}
            </div>

            <div style={{ padding: '12px 10px', flex: 1 }}>
                {nav.map(n => {
                    const active = pathname === n.id || pathname?.startsWith(n.id + '/');
                    const hasNotif = n.id === '/notifications' && unreadCount > 0;
                    return (
                        <div
                            key={n.id}
                            onClick={() => handleNav(n.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                borderRadius: 10,
                                marginBottom: 2,
                                background: active ? `${C.greenForest}55` : 'transparent',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'background .15s',
                            }}
                            onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#ffffff0f'; }}
                            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                        >
                            <span style={{ fontSize: 18 }}>{n.icon}</span>
                            <span style={{ fontSize: 14, color: active ? '#E8F0E3' : C.textLight, fontWeight: active ? 500 : 400 }}>
                                {n.label}
                            </span>
                            {hasNotif && (
                                <span style={{
                                    position: 'absolute',
                                    right: 10,
                                    minWidth: 18,
                                    height: 18,
                                    borderRadius: 9,
                                    background: C.warning,
                                    color: '#fff',
                                    fontSize: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    animation: 'badgePop .3s ease both',
                                }}>{unreadCount}</span>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ padding: '16px 12px', borderTop: '1px solid #ffffff12' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10 }}>
                    <Avatar name={userName} size={32} />
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#E8F0E3' }}>{userName}</div>
                        <div style={{ fontSize: 11, color: C.textLight, textTransform: 'capitalize' }}>{role}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
