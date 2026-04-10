'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { C, statusColors, statusLabels } from '@/lib/theme';
import { TopBar, Card, Btn, Badge, ProgressBar } from '@/components/ui';

interface FoodListing {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    status: string;
    created_at: string;
    expiry_date: string | null;
}

interface PickupRequest {
    id: string;
    listing_id: string;
    pickup_date: string;
    pickup_time: string;
    status: string;
    message: string;
    listing: { name: string; quantity: number; unit: string } | null;
    ngo: { full_name: string; org_name: string } | null;
}

const categoryEmojis: Record<string, string> = {
    'Vegetables': '🥬', 'Fruits': '🍅', 'Grains': '🌾', 'Bakery': '🍞',
    'Dairy': '🥛', 'Protein': '🥩', 'Canned': '🫙', 'Cooked Meals': '🍱', 'Other': '📦',
};

export default function DonorDashboard() {
    const { profile } = useAuth();
    const router = useRouter();
    const supabase = createClient();
    const [listings, setListings] = useState<FoodListing[]>([]);
    const [pickups, setPickups] = useState<PickupRequest[]>([]);
    const [stats, setStats] = useState({ active: 0, total: 0, completed: 0, rescued: 0 });

    useEffect(() => {
        if (!profile) return;

        // Redirect NGO to their dashboard
        if (profile.role === 'ngo') {
            router.push('/ngo/dashboard');
            return;
        }

        const fetchData = async () => {
            // Fetch listings
            const { data: listingsData } = await supabase
                .from('food_listings')
                .select('*')
                .eq('donor_id', profile.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (listingsData) {
                const typedListings = listingsData as FoodListing[];
                setListings(typedListings);
                const active = typedListings.filter((l: FoodListing) => l.status === 'available').length;
                const total = listingsData.length;
                const completed = typedListings.filter((l: FoodListing) => l.status === 'picked_up').length;
                const rescued = typedListings.filter((l: FoodListing) => l.status === 'picked_up').reduce((sum: number, l: FoodListing) => sum + l.quantity, 0);
                setStats({ active, total, completed, rescued });
            }

            // Fetch pickup requests
            const { data: pickupsData } = await supabase
                .from('pickup_requests')
                .select(`*, listing:food_listings(name, quantity, unit), ngo:profiles!pickup_requests_ngo_id_fkey(full_name, org_name)`)
                .eq('donor_id', profile.id)
                .order('created_at', { ascending: false })
                .limit(3);

            if (pickupsData) setPickups(pickupsData as unknown as PickupRequest[]);
        };

        fetchData();
    }, [profile, supabase, router]);

    const statCards = [
        { label: 'Active Listings', value: stats.active, icon: '📦', color: C.greenForest, delta: 'Currently live' },
        { label: 'Total Donations', value: stats.total, icon: '🌾', color: C.greenLeaf, delta: 'All time' },
        { label: 'Pickups Completed', value: stats.completed, icon: '✅', color: C.success, delta: `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% rate` },
        { label: 'Food Rescued (kg)', value: stats.rescued, icon: '⚖️', color: C.earthBrown, delta: 'Total weight' },
    ];

    const handlePickupAction = async (pickupId: string, action: 'scheduled' | 'cancelled') => {
        await supabase.from('pickup_requests').update({ status: action }).eq('id', pickupId);
        setPickups(prev => prev.map(p => p.id === pickupId ? { ...p, status: action } : p));
        if (action === 'scheduled') {
            const pickup = pickups.find(p => p.id === pickupId);
            if (pickup?.listing_id) {
                await supabase.from('food_listings').update({ status: 'claimed' }).eq('id', pickup.listing_id);
            }
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div className="anim">
            <TopBar
                title="Donor Dashboard"
                subtitle={`Good morning, ${profile?.full_name?.split(' ')[0] || 'there'} 👋`}
                actions={<Btn onClick={() => router.push('/post')}>＋ Post Surplus Food</Btn>}
            />

            <div className="dash-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {statCards.map(s => (
                    <Card key={s.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{s.label}</div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: C.greenDeep }}>{s.value}</div>
                                <div style={{ fontSize: 11, color: s.color, marginTop: 4 }}>{s.delta}</div>
                            </div>
                            <div style={{ fontSize: 28 }}>{s.icon}</div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="dash-panels-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.greenDeep }}>Recent Listings</h3>
                        <button onClick={() => router.push('/donations')} style={{ background: 'none', border: 'none', color: C.greenForest, fontSize: 12, cursor: 'pointer' }}>View all →</button>
                    </div>
                    {listings.length === 0 ? (
                        <p style={{ fontSize: 13, color: C.textMuted, textAlign: 'center', padding: 20 }}>No listings yet. Post your first surplus food!</p>
                    ) : (
                        listings.slice(0, 4).map(a => (
                            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.creamDark}` }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: C.creamDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                                    {categoryEmojis[a.category] || '📦'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: C.greenDeep }}>{a.name}</div>
                                    <div style={{ fontSize: 11, color: C.textMuted }}>{a.quantity} {a.unit} · {timeAgo(a.created_at)}</div>
                                </div>
                                <Badge color={statusColors[a.status]}>{statusLabels[a.status]}</Badge>
                            </div>
                        ))
                    )}
                </Card>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <Card>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.greenDeep, marginBottom: 14 }}>Pickup Requests</h3>
                        {pickups.length === 0 ? (
                            <p style={{ fontSize: 13, color: C.textMuted, textAlign: 'center', padding: 20 }}>No pickup requests yet.</p>
                        ) : (
                            pickups.filter(r => r.status === 'pending').slice(0, 2).map((r, i) => (
                                <div key={r.id} style={{ padding: '10px 0', borderBottom: i === 0 ? `1px solid ${C.creamDark}` : 'none' }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: C.greenDeep }}>{r.ngo?.org_name || r.ngo?.full_name}</div>
                                    <div style={{ fontSize: 12, color: C.textMuted }}>{r.listing?.name} {r.listing?.quantity}{r.listing?.unit}</div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                        <Btn size="sm" onClick={() => handlePickupAction(r.id, 'scheduled')}>Accept</Btn>
                                        <Btn size="sm" variant="secondary" onClick={() => handlePickupAction(r.id, 'cancelled')}>Decline</Btn>
                                    </div>
                                </div>
                            ))
                        )}
                    </Card>

                    <Card style={{ background: `linear-gradient(135deg, ${C.greenDeep}, ${C.greenForest})`, border: 'none' }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>🌍</div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#E8F0E3', marginBottom: 6 }}>Your Impact</div>
                        <p style={{ fontSize: 13, color: '#8BA88C', lineHeight: 1.5 }}>
                            You&apos;ve rescued <strong style={{ color: C.greenLeaf }}>{stats.rescued} kg</strong> of food so far. Keep it up!
                        </p>
                        <div style={{ marginTop: 14 }}>
                            <div style={{ fontSize: 12, color: '#8BA88C', marginBottom: 6 }}>Monthly goal: 150 kg</div>
                            <ProgressBar value={stats.rescued} max={150} color={C.greenLeaf} />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
