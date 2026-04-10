'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { C } from '@/lib/theme';
import { TopBar, Card, Btn, Inp } from '@/components/ui';

const categoryEmojis: Record<string, string> = {
    'Vegetables': '🥬', 'Fruits': '🍅', 'Grains': '🌾', 'Bakery': '🍞',
    'Dairy': '🥛', 'Protein': '🥩', 'Canned': '🫙', 'Cooked Meals': '🍱', 'Other': '📦',
};

interface FoodListing {
    id: string; name: string; category: string; quantity: number; unit: string;
    location: string; expiry_date: string | null; urgent: boolean; donor_id: string;
    donor: { full_name: string; org_name: string } | null;
}

export default function SchedulePickupPage() {
    const { profile } = useAuth();
    const router = useRouter();
    const params = useParams();
    const supabase = createClient();
    const [listing, setListing] = useState<FoodListing | null>(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [note, setNote] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            const { data } = await supabase
                .from('food_listings')
                .select('*, donor:profiles!food_listings_donor_id_fkey(full_name, org_name)')
                .eq('id', params.id)
                .single();
            if (data) setListing(data as unknown as FoodListing);
        };
        if (params.id) fetchListing();
    }, [params.id, supabase]);

    const handleConfirm = async () => {
        if (!date || !time || !listing || !profile) return;
        setLoading(true);

        const { error } = await supabase.from('pickup_requests').insert({
            listing_id: listing.id,
            ngo_id: profile.id,
            donor_id: listing.donor_id,
            pickup_date: date,
            pickup_time: time,
            message: note,
            status: 'pending',
        });

        if (!error) {
            // Create notification for donor
            await supabase.from('notifications').insert({
                user_id: listing.donor_id,
                icon: '🤝',
                title: 'Pickup Request',
                body: `${profile.org_name || profile.full_name} wants to pick up your ${listing.name} (${listing.quantity}${listing.unit})`,
                type: 'request',
            });
            setConfirmed(true);
        }
        setLoading(false);
    };

    if (confirmed) return (
        <div className="anim" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 72 }} className="float">✅</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: C.greenDeep }}>Pickup Scheduled!</h2>
            <p style={{ fontSize: 15, color: C.textMuted, maxWidth: 360 }}>Your pickup request has been sent to <strong>{listing?.donor?.org_name || listing?.donor?.full_name}</strong>. You&apos;ll be notified once confirmed.</p>
            <div style={{ padding: '16px 20px', borderRadius: 16, background: C.successBg, border: `1px solid ${C.success}30`, width: '100%', maxWidth: 360 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.success, marginBottom: 8 }}>Pickup Details</div>
                <div style={{ fontSize: 13, color: C.textMuted }}>📦 {listing?.name} · {listing?.quantity}{listing?.unit}</div>
                <div style={{ fontSize: 13, color: C.textMuted }}>📅 {date} at {time}</div>
                <div style={{ fontSize: 13, color: C.textMuted }}>📍 {listing?.location}</div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
                <Btn onClick={() => router.push('/ngo/pickups')}>View My Pickups</Btn>
                <Btn variant="secondary" onClick={() => router.push('/ngo/dashboard')}>Back to Dashboard</Btn>
            </div>
        </div>
    );

    if (!listing) return <div style={{ padding: 40, textAlign: 'center', color: C.textMuted }}>Loading...</div>;

    return (
        <div className="anim">
            <TopBar title="Schedule Pickup" subtitle="Arrange collection of surplus food" actions={<Btn variant="ghost" onClick={() => router.push('/browse')}>← Back</Btn>} />
            <div className="schedule-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Card>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.greenDeep, marginBottom: 14 }}>🍽 Food Being Claimed</h3>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', borderRadius: 12, background: C.creamDark }}>
                            <div style={{ width: 52, height: 52, borderRadius: 12, background: C.creamCard, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                                {categoryEmojis[listing.category] || '📦'}
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: C.greenDeep }}>{listing.name}</div>
                                <div style={{ fontSize: 12, color: C.textMuted }}>{listing.quantity} {listing.unit} · Expires {listing.expiry_date ? new Date(listing.expiry_date).toLocaleDateString() : 'N/A'}</div>
                                <div style={{ fontSize: 12, color: C.greenForest }}>🏪 {listing.donor?.org_name || listing.donor?.full_name} · 📍 {listing.location}</div>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.greenDeep, marginBottom: 16 }}>📅 Choose Pickup Time</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <Inp label="Preferred Date" type="date" value={date} onChange={setDate} icon="📅" />
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: C.greenDeep, display: 'block', marginBottom: 8 }}>Preferred Time Slot</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                    {['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'].map(t => (
                                        <button key={t} onClick={() => setTime(t)} style={{
                                            padding: '9px 6px', borderRadius: 10, fontSize: 12,
                                            border: `1.5px solid ${time === t ? C.greenForest : C.inputBorder}`,
                                            background: time === t ? `${C.greenForest}12` : 'transparent',
                                            color: time === t ? C.greenForest : C.textMuted,
                                            fontWeight: time === t ? 600 : 400,
                                        }}>{t}</button>
                                    ))}
                                </div>
                            </div>
                            <Inp label="Message to Donor (optional)" placeholder="Any special instructions..." multiline rows={3} value={note} onChange={setNote} icon="💬" />
                        </div>
                    </Card>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Card>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.greenDeep, marginBottom: 14 }}>📍 Pickup Location</h3>
                        <div style={{ height: 180, borderRadius: 12, background: `linear-gradient(135deg, ${C.greenDeep}20, ${C.greenForest}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.inputBorder}`, flexDirection: 'column', gap: 8 }}>
                            <div style={{ fontSize: 36 }}>🗺️</div>
                            <div style={{ fontSize: 13, color: C.textMuted }}>{listing.donor?.org_name || listing.donor?.full_name}</div>
                            <div style={{ fontSize: 11, color: C.textLight }}>{listing.location}</div>
                        </div>
                    </Card>
                    <Card>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.greenDeep, marginBottom: 12 }}>📋 Summary</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[['Food', `${listing.name} · ${listing.quantity}${listing.unit}`], ['Donor', listing.donor?.org_name || listing.donor?.full_name || ''], ['Location', listing.location], ['Date', date || 'Not selected'], ['Time', time || 'Not selected']].map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: C.textMuted }}>{k}</span>
                                    <span style={{ color: C.greenDeep, fontWeight: 500 }}>{v}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <Btn full onClick={handleConfirm} disabled={!date || !time || loading} style={{ opacity: date && time ? 1 : 0.5 }}>
                                {loading ? 'Submitting...' : '📅 Confirm Pickup Request'}
                            </Btn>
                            <Btn full variant="secondary" onClick={() => router.push('/browse')}>Cancel</Btn>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
