'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { C, statusColors, statusLabels } from '@/lib/theme';
import { TopBar, Card, Btn, Badge, Avatar } from '@/components/ui';

interface PickupRequest {
    id: string;
    pickup_date: string;
    pickup_time: string;
    status: string;
    message: string;
    created_at: string;
    ngo: { full_name: string; org_name: string } | null;
    listing: { name: string; quantity: number; unit: string } | null;
}

export default function PickupsPage() {
    const { profile } = useAuth();
    const supabase = createClient();
    const [pickups, setPickups] = useState<PickupRequest[]>([]);

    useEffect(() => {
        if (!profile) return;
        const fetchPickups = async () => {
            const { data } = await supabase
                .from('pickup_requests')
                .select('*, listing:food_listings(name, quantity, unit), ngo:profiles!pickup_requests_ngo_id_fkey(full_name, org_name)')
                .eq('donor_id', profile.id)
                .order('created_at', { ascending: false });
            if (data) setPickups(data as unknown as PickupRequest[]);
        };
        fetchPickups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    const handleAction = async (id: string, status: 'scheduled' | 'cancelled') => {
        await supabase.from('pickup_requests').update({ status }).eq('id', id);
        setPickups(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    };

    const counts = {
        pending: pickups.filter(p => p.status === 'pending').length,
        scheduled: pickups.filter(p => p.status === 'scheduled').length,
        completed: pickups.filter(p => p.status === 'completed').length,
    };

    return (
        <div className="anim">
            <TopBar title="Pickup Requests" subtitle="NGOs requesting to collect your listed food" />

            <div className="pickups-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Pending', val: counts.pending, color: C.warning },
                    { label: 'Scheduled', val: counts.scheduled, color: C.greenLeaf },
                    { label: 'Completed', val: counts.completed, color: C.success },
                ].map(s => (
                    <Card key={s.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{s.label}</div>
                    </Card>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {pickups.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: 40 }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🚚</div>
                        <p style={{ fontSize: 14, color: C.textMuted }}>No pickup requests yet.</p>
                    </Card>
                ) : (
                    pickups.map(r => (
                        <Card key={r.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <Avatar name={r.ngo?.org_name || r.ngo?.full_name || '?'} size={44} bg={C.greenForest} />
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: C.greenDeep }}>{r.ngo?.org_name || r.ngo?.full_name}</div>
                                        <div style={{ fontSize: 12, color: C.textMuted }}>Requesting: {r.listing?.name} · {r.listing?.quantity} {r.listing?.unit}</div>
                                        <div style={{ fontSize: 12, color: C.greenForest, marginTop: 2 }}>📅 {r.pickup_date} at {r.pickup_time}</div>
                                    </div>
                                </div>
                                <Badge color={statusColors[r.status]}>{statusLabels[r.status]}</Badge>
                            </div>
                            {r.message && (
                                <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: C.creamDark, fontSize: 12, color: C.textMuted, fontStyle: 'italic' }}>
                                    &quot;{r.message}&quot;
                                </div>
                            )}
                            {r.status === 'pending' && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                    <Btn size="sm" full onClick={() => handleAction(r.id, 'scheduled')}>✓ Accept Pickup</Btn>
                                    <Btn size="sm" variant="danger" full onClick={() => handleAction(r.id, 'cancelled')}>✗ Decline</Btn>
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
