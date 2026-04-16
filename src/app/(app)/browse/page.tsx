'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { C } from '@/lib/theme';
import { TopBar, Card, Btn, Badge } from '@/components/ui';

const categoryEmojis: Record<string, string> = {
    'Vegetables': '🥬', 'Fruits': '🍅', 'Grains': '🌾', 'Bakery': '🍞',
    'Dairy': '🥛', 'Protein': '🥩', 'Canned': '🫙', 'Cooked Meals': '🍱', 'Other': '📦',
};

interface FoodItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    urgent: boolean;
    location: string;
    expiry_date: string | null;
    created_at: string;
    donor: { full_name: string; org_name: string } | null;
}

export default function BrowseFoodPage() {
    const router = useRouter();
    const supabase = createClient();
    const [food, setFood] = useState<FoodItem[]>([]);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('All');
    const cats = ['All', 'Vegetables', 'Fruits', 'Grains', 'Bakery', 'Cooked Meals', 'Dairy', 'Protein', 'Canned'];

    useEffect(() => {
        const fetchFood = async () => {
            const { data } = await supabase
                .from('food_listings')
                .select('*, donor:profiles!food_listings_donor_id_fkey(full_name, org_name)')
                .eq('status', 'available')
                .order('created_at', { ascending: false });
            if (data) setFood(data as unknown as FoodItem[]);
        };
        fetchFood();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = food.filter(f =>
        (catFilter === 'All' || f.category === catFilter) &&
        (f.name.toLowerCase().includes(search.toLowerCase()) || (f.donor?.org_name || '').toLowerCase().includes(search.toLowerCase()))
    );

    const formatExpiry = (d: string | null) => {
        if (!d) return 'N/A';
        const diff = new Date(d).getTime() - Date.now();
        if (diff < 0) return 'Expired';
        if (diff < 86400000) return 'Today';
        if (diff < 172800000) return 'Tomorrow';
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div className="anim">
            <TopBar title="Browse Available Food" subtitle={`${filtered.length} listings available`} />

            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
                    <input placeholder="Search food or donor..." value={search} onChange={e => setSearch(e.target.value)} style={{
                        width: '100%', padding: '11px 14px 11px 40px', border: `1.5px solid ${C.inputBorder}`, borderRadius: 12, fontSize: 14, background: C.creamCard,
                    }} />
                </div>
            </div>

            <div className="filter-pills" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {cats.map(c => (
                    <button key={c} onClick={() => setCatFilter(c)} style={{
                        padding: '7px 16px', borderRadius: 20, fontSize: 12,
                        border: `1.5px solid ${catFilter === c ? C.greenForest : C.inputBorder}`,
                        background: catFilter === c ? `${C.greenForest}12` : 'transparent',
                        color: catFilter === c ? C.greenForest : C.textMuted,
                        fontWeight: catFilter === c ? 600 : 400,
                    }}>{c}</button>
                ))}
            </div>

            <div className="browse-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {filtered.length === 0 ? (
                    <Card style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                        <p style={{ fontSize: 14, color: C.textMuted }}>No food listings found matching your criteria.</p>
                    </Card>
                ) : (
                    filtered.map(f => (
                        <Card key={f.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/schedule/${f.id}`)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <div style={{ width: 52, height: 52, borderRadius: 14, background: C.creamDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                                    {categoryEmojis[f.category] || '📦'}
                                </div>
                                {f.urgent && <Badge color={C.danger}>🚨 Urgent</Badge>}
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: C.greenDeep }}>{f.name}</div>
                            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{f.quantity} {f.unit} · 📅 Exp: {formatExpiry(f.expiry_date)}</div>
                            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>🏪 {f.donor?.org_name || f.donor?.full_name}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                                <span style={{ fontSize: 11, color: C.textLight }}>{timeAgo(f.created_at)}</span>
                                <Btn size="sm" onClick={e => { e.stopPropagation(); router.push(`/schedule/${f.id}`); }}>Claim →</Btn>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
