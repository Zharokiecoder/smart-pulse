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
                        <Card key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }} className="dash-card-row">
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
                                {p.status === 'scheduled' && <Btn size="sm">View Details</Btn>}
                                {p.status === 'pending' && <Btn size="sm" variant="secondary">Awaiting Confirm</Btn>}
                                {p.status === 'completed' && <Btn size="sm" variant="secondary">Receipt</Btn>}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
