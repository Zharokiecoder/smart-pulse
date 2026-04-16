'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { C } from '@/lib/theme';
import { TopBar, Card, Btn, Badge, ProgressBar } from '@/components/ui';

interface FoodListing {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    status: string;
    urgent: boolean;
    location: string;
    expiry_date: string | null;
    donor: { full_name: string; org_name: string } | null;
}

const categoryEmojis: Record<string, string> = {
    'Vegetables': '🥬', 'Fruits': '🍅', 'Grains': '🌾', 'Bakery': '🍞',
    'Dairy': '🥛', 'Protein': '🥩', 'Canned': '🫙', 'Cooked Meals': '🍱', 'Other': '📦',
};

export default function NgoDashboard() {
    const { profile } = useAuth();
    const router = useRouter();
    const supabase = createClient();
    const [nearbyFood, setNearbyFood] = useState<FoodListing[]>([]);
    const [stats, setStats] = useState({ available: 0, scheduled: 0, completed: 0, collected: 0 });

    useEffect(() => {
        if (!profile) return;
        if (profile.role === 'donor') { router.push('/dashboard'); return; }

        const fetchData = async () => {
            // Fetch available food
            const { data: foodData } = await supabase
                .from('food_listings')
                .select('*, donor:profiles!food_listings_donor_id_fkey(full_name, org_name)')
                .eq('status', 'available')
                .order('created_at', { ascending: false })
                .limit(6);
            if (foodData) setNearbyFood(foodData as unknown as FoodListing[]);

            // Fetch pickup stats
            const { data: pickupsData } = await supabase
                .from('pickup_requests')
                .select('status, listing:food_listings(quantity)')
                .eq('ngo_id', profile.id);

            if (pickupsData) {
                const scheduled = pickupsData.filter(p => p.status === 'scheduled' || p.status === 'pending').length;
                const completed = pickupsData.filter(p => p.status === 'completed').length;
                const collected = pickupsData.filter(p => p.status === 'completed').reduce((sum, p) => {
                    const listing = p.listing as unknown as { quantity: number } | null;
                    return sum + (listing?.quantity || 0);
                }, 0);
                setStats({ available: foodData?.length || 0, scheduled, completed, collected });
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile, router]);

    const ngoStatCards = [
        { label: 'Available Near Me', value: stats.available, icon: '📦', color: C.greenForest },
        { label: 'Pickups Scheduled', value: stats.scheduled, icon: '📅', color: C.warning },
        { label: 'Pickups Completed', value: stats.completed, icon: '✅', color: C.success },
        { label: 'Food Collected (kg)', value: stats.collected, icon: '⚖️', color: C.earthBrown },
    ];

    const formatExpiry = (d: string | null) => {
        if (!d) return 'N/A';
        const diff = new Date(d).getTime() - Date.now();
        if (diff < 0) return 'Expired';
        if (diff < 86400000) return 'Today';
        if (diff < 172800000) return 'Tomorrow';
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="anim">
            <TopBar title="NGO Dashboard" subtitle={`Welcome, ${profile?.full_name?.split(' ')[0]} 👋 — ${profile?.org_name}`} actions={<Btn onClick={() => router.push('/browse')}>🔍 Browse All Food</Btn>} />

            <div className="dash-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {ngoStatCards.map(s => (
                    <Card key={s.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{s.label}</div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: C.greenDeep }}>{s.value}</div>
                            </div>
                            <div style={{ fontSize: 28 }}>{s.icon}</div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="ngo-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.greenDeep }}>🍽 Available Food Nearby</h3>
                        <button onClick={() => router.push('/browse')} style={{ background: 'none', border: 'none', color: C.greenForest, fontSize: 12, cursor: 'pointer' }}>View all →</button>
                    </div>
                    {nearbyFood.length === 0 ? (
                        <p style={{ fontSize: 13, color: C.textMuted, textAlign: 'center', padding: 20 }}>No available food listings found.</p>
                    ) : (
                        nearbyFood.slice(0, 4).map(f => (
                            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.creamDark}` }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: C.creamDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                                    {categoryEmojis[f.category] || '📦'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 13, fontWeight: 500, color: C.greenDeep }}>{f.name}</span>
                                        {f.urgent && <Badge color={C.danger}>🚨 Urgent</Badge>}
                                    </div>
                                    <div style={{ fontSize: 11, color: C.textMuted }}>{f.quantity} {f.unit} · {f.donor?.org_name || f.donor?.full_name} · Exp: {formatExpiry(f.expiry_date)}</div>
                                </div>
                                <Btn size="sm" onClick={() => router.push(`/schedule/${f.id}`)}>Claim</Btn>
                            </div>
                        ))
                    )}
                </Card>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <Card style={{ background: `linear-gradient(135deg, ${C.greenDeep}, ${C.greenForest})`, border: 'none' }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#E8F0E3', marginBottom: 6 }}>Monthly Impact</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div><div style={{ fontSize: 20, fontWeight: 700, color: C.greenLeaf }}>{stats.collected} kg</div><div style={{ fontSize: 10, color: '#8BA88C' }}>Food collected</div></div>
                            <div><div style={{ fontSize: 20, fontWeight: 700, color: C.greenLeaf }}>{stats.completed}</div><div style={{ fontSize: 10, color: '#8BA88C' }}>Pickups done</div></div>
                        </div>
                        <ProgressBar value={stats.collected} max={500} color={C.greenLeaf} />
                        <div style={{ fontSize: 10, color: '#8BA88C', marginTop: 4 }}>Goal: 500 kg/month</div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
