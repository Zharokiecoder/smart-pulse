'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import Sidebar from '@/components/layout/Sidebar';
import { C } from '@/lib/theme';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { profile, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: C.creamBg,
                flexDirection: 'column',
                gap: 16,
            }}>
                <div style={{
                    width: 48,
                    height: 48,
                    border: `3px solid ${C.greenForest}30`,
                    borderTopColor: C.greenForest,
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <span style={{ fontSize: 14, color: C.textMuted }}>Loading...</span>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Mobile hamburger button */}
            <button
                className="sidebar-mobile-toggle"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
            >
                ☰
            </button>

            {/* Sidebar overlay for mobile */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'overlay-visible' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            <Sidebar
                role={profile?.role || 'donor'}
                userName={profile?.full_name || 'User'}
                unreadCount={0}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="dash-main" style={{ flex: 1, marginLeft: 220, overflow: 'auto' }}>
                <div className="dash-content">
                    {children}
                </div>
            </div>
        </div>
    );
}
