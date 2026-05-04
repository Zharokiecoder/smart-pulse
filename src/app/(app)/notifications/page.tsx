'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { C } from '@/lib/theme';
import { TopBar, Card, Btn } from '@/components/ui';

interface Notification {
    id: string;
    icon: string;
    title: string;
    body: string;
    type: string;
    read: boolean;
    created_at: string;
}

const typeColors: Record<string, string> = {
    request: C.greenForest, success: C.success, warning: C.warning, message: C.earthBrown, info: C.greenLeaf,
};

export default function NotificationsPage() {
    const { profile } = useAuth();
    const supabase = createClient();
    const [notifs, setNotifs] = useState<Notification[]>([]);

    useEffect(() => {
        if (!profile) return;
        const fetchNotifs = async () => {
            try {
                const { data } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', profile.id)
                    .order('created_at', { ascending: false });
                if (data) setNotifs(data);
            } catch {
                // Fetch failed
            }
        };
        fetchNotifs();

        // Real-time subscription
        const channel = supabase
            .channel('notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` },
                (payload) => setNotifs(prev => [payload.new as Notification, ...prev])
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    const markAllRead = async () => {
        await supabase.from('notifications').update({ read: true }).eq('user_id', profile?.id).eq('read', false);
        setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    };

    const markRead = async (id: string) => {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const timeAgo = (d: string) => {
        const diff = Date.now() - new Date(d).getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const unreadCount = notifs.filter(n => !n.read).length;

    return (
        <div className="anim">
            <TopBar title="Notifications" subtitle={`${unreadCount} unread`} actions={<Btn variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Btn>} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notifs.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: 40 }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
                        <p style={{ fontSize: 14, color: C.textMuted }}>No notifications yet. You&apos;ll see updates here.</p>
                    </Card>
                ) : (
                    notifs.map(n => (
                        <Card key={n.id} onClick={() => markRead(n.id)} style={{
                            display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer',
                            opacity: n.read ? 0.8 : 1,
                            borderLeft: `3px solid ${n.read ? 'transparent' : typeColors[n.type] || C.greenForest}`,
                        }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${typeColors[n.type] || C.greenForest}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                                {n.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: C.greenDeep }}>{n.title}</span>
                                    <span style={{ fontSize: 11, color: C.textLight, flexShrink: 0, marginLeft: 8 }}>{timeAgo(n.created_at)}</span>
                                </div>
                                <p style={{ fontSize: 12, color: C.textMuted, marginTop: 3, lineHeight: 1.5 }}>{n.body}</p>
                            </div>
                            {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColors[n.type] || C.greenForest, flexShrink: 0, marginTop: 6 }} />}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
