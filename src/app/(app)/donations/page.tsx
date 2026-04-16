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

interface Donation {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    status: string;
    created_at: string;
    expiry_date: string | null;
    views_count: number;
    location: string;
    notes: string;
    urgent: boolean;
}

export default function MyDonationsPage() {
    const { profile } = useAuth();
    const router = useRouter();
    const supabase = createClient();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [filter, setFilter] = useState('all');
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        if (!profile) return;
        const fetchDonations = async () => {
            const { data } = await supabase
                .from('food_listings')
                .select('*')
                .eq('donor_id', profile.id)
                .order('created_at', { ascending: false });
            if (data) setDonations(data);
        };
        fetchDonations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    const filtered = filter === 'all' ? donations : donations.filter(d => d.status === filter);

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        await supabase.from('food_listings').delete().eq('id', id);
        setDonations(prev => prev.filter(d => d.id !== id));
    };

    return (
        <div className="anim">
            <TopBar title="My Donations" subtitle={`${donations.length} total listings`} actions={<Btn onClick={() => router.push('/post')}>＋ New Listing</Btn>} />

            <div className="filter-pills" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {['all', 'available', 'claimed', 'picked_up', 'expired'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '7px 16px', borderRadius: 20, fontSize: 12,
                        border: `1.5px solid ${filter === f ? C.greenForest : C.inputBorder}`,
                        background: filter === f ? `${C.greenForest}12` : 'transparent',
                        color: filter === f ? C.greenForest : C.textMuted,
                        fontWeight: filter === f ? 600 : 400,
                    }}>{f === 'all' ? 'All' : statusLabels[f]}</button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filtered.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: 40 }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                        <p style={{ fontSize: 14, color: C.textMuted }}>No donations found. Post your first surplus food!</p>
                        <div style={{ marginTop: 16 }}><Btn onClick={() => router.push('/post')}>Post Surplus Food</Btn></div>
                    </Card>
                ) : (
                    filtered.map(d => (
                        <React.Fragment key={d.id}>
                            <Card style={{ display: 'flex', alignItems: 'center', gap: 16 }} className="dash-card-row">
                                <div style={{ width: 52, height: 52, borderRadius: 14, background: C.creamDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                                    {categoryEmojis[d.category] || '📦'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: C.greenDeep }}>{d.name}</span>
                                        <Badge color={statusColors[d.status]}>{statusLabels[d.status]}</Badge>
                                    </div>
                                    <div className="meta-row" style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                                        <span style={{ fontSize: 12, color: C.textMuted }}>⚖️ {d.quantity} {d.unit}</span>
                                        <span style={{ fontSize: 12, color: C.textMuted }}>📅 Posted {formatDate(d.created_at)}</span>
                                        {d.expiry_date && <span style={{ fontSize: 12, color: d.status === 'expired' ? C.danger : C.textMuted }}>⏰ Exp: {formatDate(d.expiry_date)}</span>}
                                        <span style={{ fontSize: 12, color: C.textMuted }}>👁 {d.views_count} views</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {d.status === 'available' && <Btn size="sm" variant="secondary" onClick={() => router.push(`/post?edit=${d.id}`)}>Edit</Btn>}
                                    <Btn size="sm" variant="ghost" onClick={() => setExpanded(expanded === d.id ? null : d.id)}>{expanded === d.id ? 'Hide' : 'Details'}</Btn>
                                </div>
                            </Card>
                            {expanded === d.id && (
                                <Card style={{ marginTop: -8, borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: '14px 20px', background: C.creamDark }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                                        <div><span style={{ color: C.textMuted }}>📍 Location:</span> <span style={{ color: C.greenDeep }}>{d.location || 'Not set'}</span></div>
                                        <div><span style={{ color: C.textMuted }}>📝 Notes:</span> <span style={{ color: C.greenDeep }}>{d.notes || 'None'}</span></div>
                                        <div><span style={{ color: C.textMuted }}>🚨 Urgent:</span> <span style={{ color: d.urgent ? C.danger : C.greenDeep }}>{d.urgent ? 'Yes' : 'No'}</span></div>
                                        <div><span style={{ color: C.textMuted }}>👁 Views:</span> <span style={{ color: C.greenDeep }}>{d.views_count}</span></div>
                                    </div>
                                    {d.status === 'available' && (
                                        <div style={{ marginTop: 12 }}>
                                            <Btn size="sm" variant="danger" onClick={() => handleDelete(d.id)}>🗑 Delete Listing</Btn>
                                        </div>
                                    )}
                                </Card>
                            )}
                        </React.Fragment>
                    ))
                )}
            </div>
        </div>
    );
}
