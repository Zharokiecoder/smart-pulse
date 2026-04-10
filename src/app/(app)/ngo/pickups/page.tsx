'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { C, statusColors, statusLabels } from '@/lib/theme';
import { TopBar, Card, Btn, Badge } from '@/components/ui';

const categoryEmojis: Record<string, string> = {
    'Vegetables': '🥬', 'Fruits': '🍅', 'Grains': '🌾', 'Bakery': '🍞',
    'Dairy': '🥛', 'Protein': '🥩', 'Canned': '🫙', 'Cooked Meals': '🍱', 'Other': '📦',
};

interface Pickup {
    id: string;
    pickup_date: string;
    pickup_time: string;
    status: string;
    listing: { name: string; category: string; quantity: number; unit: string } | null;
    donor: { full_name: string; org_name: string } | null;
}

export default function NgoPickupsPage() {
    const { profile } = useAuth();
    const router = useRouter();
    const supabase = createClient();
    const [pickups, setPickups] = useState<Pickup[]>([]);
    const [tab, setTab] = useState('upcoming');
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        if (!profile) return;
        const fetchPickups = async () => {
            const { data } = await supabase
                .from('pickup_requests')
                .select('*, listing:food_listings(name, category, quantity, unit), donor:profiles!pickup_requests_donor_id_fkey(full_name, org_name)')
                .eq('ngo_id', profile.id)
                .order('created_at', { ascending: false });
            if (data) setPickups(data as unknown as Pickup[]);
        };
        fetchPickups();
    }, [profile, supabase]);

    const upcoming = pickups.filter(p => ['pending', 'scheduled'].includes(p.status));
    const history = pickups.filter(p => ['completed', 'cancelled'].includes(p.status));
    const list = tab === 'upcoming' ? upcoming : history;

    const handleMarkComplete = async (id: string) => {
        await supabase.from('pickup_requests').update({ status: 'completed' }).eq('id', id);
        setPickups(prev => prev.map(p => p.id === id ? { ...p, status: 'completed' } : p));
    };

    const handleReceipt = (p: Pickup) => {
        const receipt = `
=== FOODRESCUE PICKUP RECEIPT ===
Date: ${p.pickup_date} at ${p.pickup_time}
Food: ${p.listing?.name || 'N/A'}
Quantity: ${p.listing?.quantity || 0} ${p.listing?.unit || ''}
Donor: ${p.donor?.org_name || p.donor?.full_name || 'N/A'}
Status: Completed
================================`;
        const blob = new Blob([receipt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${p.id.slice(0, 8)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="anim">
            <TopBar title="My Pickups" subtitle="Track all your food collection activities" actions={<Btn onClick={() => router.push('/browse')}>＋ Schedule New</Btn>} />

            <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: C.creamDark, borderRadius: 12, padding: 4, width: 'fit-content' }}>
                {['upcoming', 'history'].map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '9px 22px', borderRadius: 9, border: 'none', fontSize: 13,
                        background: tab === t ? C.creamCard : 'transparent', color: tab === t ? C.greenDeep : C.textMuted,
                        fontWeight: tab === t ? 600 : 400, transition: 'all .2s',
                        boxShadow: tab === t ? '0 2px 8px #00000010' : 'none',
                    }}>{t === 'upcoming' ? '📅 Upcoming' : '🕓 History'}</button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {list.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: 40 }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🚚</div>
                        <p style={{ fontSize: 14, color: C.textMuted }}>No {tab} pickups found.</p>
                    </Card>
                ) : (
                    list.map(p => (
                        <React.Fragment key={p.id}>
                            <Card style={{ display: 'flex', alignItems: 'center', gap: 16 }} className="dash-card-row">
                                <div style={{ width: 52, height: 52, borderRadius: 14, background: C.creamDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                                    {categoryEmojis[p.listing?.category || ''] || '📦'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: C.greenDeep }}>{p.listing?.name}</span>
                                        <Badge color={statusColors[p.status]}>{statusLabels[p.status]}</Badge>
                                    </div>
                                    <div className="meta-row" style={{ display: 'flex', gap: 14 }}>
                                        <span style={{ fontSize: 12, color: C.textMuted }}>⚖️ {p.listing?.quantity} {p.listing?.unit}</span>
                                        <span style={{ fontSize: 12, color: C.textMuted }}>🏪 {p.donor?.org_name || p.donor?.full_name}</span>
                                        <span style={{ fontSize: 12, color: C.greenForest }}>📅 {p.pickup_date} · {p.pickup_time}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {p.status === 'scheduled' && (
                                        <>
                                            <Btn size="sm" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>{expanded === p.id ? 'Hide' : 'Details'}</Btn>
                                            <Btn size="sm" variant="secondary" onClick={() => handleMarkComplete(p.id)}>✓ Complete</Btn>
                                        </>
                                    )}
                                    {p.status === 'pending' && <Btn size="sm" variant="secondary" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>Awaiting Confirm</Btn>}
                                    {p.status === 'completed' && <Btn size="sm" variant="secondary" onClick={() => handleReceipt(p)}>📥 Receipt</Btn>}
                                </div>
                            </Card>
                            {expanded === p.id && (
                                <Card style={{ marginTop: -10, borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: '12px 20px', background: C.creamDark }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                                        <div><span style={{ color: C.textMuted }}>📅 Date:</span> <span style={{ color: C.greenDeep }}>{p.pickup_date} at {p.pickup_time}</span></div>
                                        <div><span style={{ color: C.textMuted }}>🏪 Donor:</span> <span style={{ color: C.greenDeep }}>{p.donor?.org_name || p.donor?.full_name}</span></div>
                                        <div><span style={{ color: C.textMuted }}>📦 Food:</span> <span style={{ color: C.greenDeep }}>{p.listing?.name} · {p.listing?.quantity} {p.listing?.unit}</span></div>
                                        <div><span style={{ color: C.textMuted }}>📋 Status:</span> <Badge color={statusColors[p.status]}>{statusLabels[p.status]}</Badge></div>
                                    </div>
                                </Card>
                            )}
                        </React.Fragment>
                    ))
                )}
            </div>
        </div>
    );
}
