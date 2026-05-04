'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import { C } from '@/lib/theme';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { profile, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [forceReady, setForceReady] = useState(false);
    const supabase = createClient();

    // Fallback: never show spinner for more than 8 seconds
    useEffect(() => {
        if (!loading) return;
        const timer = setTimeout(() => setForceReady(true), 8000);
        return () => clearTimeout(timer);
    }, [loading]);

    useEffect(() => {
        if (!profile) return;
        const fetchUnread = async () => {
            try {
                const { count } = await supabase
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', profile.id)
                    .eq('read', false);
                setUnreadCount(count || 0);
            } catch {
                // Notification count fetch failed — not critical
            }
        };
        fetchUnread();

        const channel = supabase
            .channel('appshell-notifs')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` },
                () => setUnreadCount(prev => prev + 1)
            )
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` },
                () => fetchUnread()
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    if (loading && !forceReady) {
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
                unreadCount={unreadCount}
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
