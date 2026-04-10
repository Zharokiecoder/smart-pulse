'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { C } from '@/lib/theme';
import { TopBar, Card, Btn, Inp, Badge } from '@/components/ui';

const categories = ['🥬 Vegetables', '🍅 Fruits', '🌾 Grains', '🍞 Bakery', '🥛 Dairy', '🥩 Protein', '🫙 Canned', '🍱 Cooked Meals', 'Other'];

export default function PostFoodPage() {
    const { profile } = useAuth();
    const router = useRouter();
    const supabase = createClient();
    const [form, setForm] = useState({ name: '', category: '', qty: '', unit: 'kg', expiry: '', location: '', notes: '', urgent: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    type FormKey = 'name' | 'category' | 'qty' | 'unit' | 'expiry' | 'location' | 'notes';
    const f = (k: FormKey) => ({ value: form[k], onChange: (v: string) => setForm(p => ({ ...p, [k]: v })) });

    const handleSubmit = async () => {
        if (!form.name || !form.category || !form.qty || !form.location) {
            setError('Please fill in all required fields');
            return;
        }
        setLoading(true);
        setError('');

        const { error: insertError } = await supabase.from('food_listings').insert({
            donor_id: profile?.id,
            name: form.name,
            category: form.category.replace(/^[^\s]+ /, ''), // remove emoji prefix
            quantity: parseFloat(form.qty),
            unit: form.unit,
            expiry_date: form.expiry || null,
            location: form.location,
            notes: form.notes,
            urgent: form.urgent,
            status: 'available',
        });

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
        } else {
            router.push('/donations');
        }
    };

    return (
        <div className="anim">
            <TopBar title="Post Surplus Food" subtitle="List available food for NGOs to claim" actions={<Btn variant="ghost" onClick={() => router.push('/dashboard')}>← Back</Btn>} />

            {error && (
                <div style={{ padding: '10px 14px', borderRadius: 12, background: C.dangerBg, border: `1px solid ${C.danger}30`, fontSize: 13, color: C.danger, marginBottom: 16 }}>{error}</div>
            )}

            <div className="dash-panels-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
                <Card>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: C.greenDeep, marginBottom: 20 }}>Food Details</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <Inp label="Food Name" placeholder="e.g. Fresh Tomatoes" icon="🏷️" {...f('name')} />
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: C.greenDeep, display: 'block', marginBottom: 6 }}>Category</label>
                            <div className="filter-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {categories.map(c => (
                                    <button key={c} onClick={() => setForm(p => ({ ...p, category: c }))} style={{
                                        padding: '6px 12px', borderRadius: 20, fontSize: 12,
                                        border: `1.5px solid ${form.category === c ? C.greenForest : C.inputBorder}`,
                                        background: form.category === c ? `${C.greenForest}12` : 'transparent',
                                        color: form.category === c ? C.greenForest : C.textMuted,
                                        fontWeight: form.category === c ? 600 : 400,
                                    }}>{c}</button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
                            <Inp label="Quantity" placeholder="e.g. 20" icon="⚖️" {...f('qty')} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: C.greenDeep }}>Unit</label>
                                <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} style={{
                                    padding: '12px 14px', border: `1.5px solid ${C.inputBorder}`, borderRadius: 12, fontSize: 14, background: C.inputBg, color: C.greenDeep, height: 45,
                                }}>
                                    {['kg', 'lbs', 'litres', 'pcs', 'boxes', 'bags'].map(u => <option key={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>
                        <Inp label="Expiry Date / Best Before" type="date" {...f('expiry')} icon="📅" />
                        <Inp label="Pickup Location" placeholder="Enter address or area" icon="📍" {...f('location')} />
                        <Inp label="Additional Notes" placeholder="Any handling instructions, allergens, etc." icon="📝" multiline rows={3} {...f('notes')} />
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: C.warningBg, border: `1px solid ${C.warningBorder}`, cursor: 'pointer' }}
                            onClick={() => setForm(p => ({ ...p, urgent: !p.urgent }))}
                        >
                            <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${form.urgent ? C.warning : C.inputBorder}`, background: form.urgent ? C.warning : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff' }}>
                                {form.urgent && '✓'}
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 500, color: C.greenDeep }}>Mark as Urgent</div>
                                <div style={{ fontSize: 11, color: C.textMuted }}>Food expires within 24 hours</div>
                            </div>
                        </div>
                    </div>
                </Card>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Card>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.greenDeep, marginBottom: 14 }}>📸 Add Photos</h3>
                        <div style={{ border: `2px dashed ${C.inputBorder}`, borderRadius: 14, padding: 32, textAlign: 'center', cursor: 'pointer', background: C.inputBg }}>
                            <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: C.greenDeep }}>Upload food photos</div>
                            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>PNG, JPG up to 5MB each</div>
                            <div style={{ marginTop: 12 }}><Btn size="sm" variant="secondary">Browse files</Btn></div>
                        </div>
                    </Card>

                    <Card>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.greenDeep, marginBottom: 14 }}>👁 Preview</h3>
                        <div style={{ padding: 14, borderRadius: 12, background: C.creamDark, border: `1px solid ${C.inputBorder}` }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.greenDeep }}>{form.name || 'Food Name'}</div>
                            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{form.qty ? `${form.qty} ${form.unit}` : 'Quantity'} · {form.category || 'Category'}</div>
                            {form.expiry && <div style={{ fontSize: 11, color: C.warning, marginTop: 4 }}>⏰ Expires: {form.expiry}</div>}
                            {form.location && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>📍 {form.location}</div>}
                            {form.urgent && <div style={{ marginTop: 8 }}><Badge color={C.danger}>🚨 Urgent</Badge></div>}
                        </div>
                    </Card>

                    <Card style={{ background: `linear-gradient(135deg, ${C.greenForest}, ${C.greenLeaf})`, border: 'none' }}>
                        <div style={{ fontSize: 13, color: '#c8e6c9', marginBottom: 12 }}>✅ Posting this will notify NGOs in your area.</div>
                        <Btn full style={{ background: '#fff', color: C.greenForest }} onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Posting...' : 'Post Surplus Food 🌾'}
                        </Btn>
                    </Card>
                </div>
            </div>
        </div>
    );
}
