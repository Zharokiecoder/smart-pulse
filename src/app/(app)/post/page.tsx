'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { C } from '@/lib/theme';
import { TopBar, Card, Btn, Inp, Badge } from '@/components/ui';

const categories = ['🥬 Vegetables', '🍅 Fruits', '🌾 Grains', '🍞 Bakery', '🥛 Dairy', '🥩 Protein', '🫙 Canned', '🍱 Cooked Meals', 'Other'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export default function PostFoodPage() {
    const { profile } = useAuth();
    const router = useRouter();
    const supabase = createClient();
    const [form, setForm] = useState({ name: '', category: '', qty: '', unit: 'kg', expiry: '', location: '', notes: '', urgent: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Image upload state
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    type FormKey = 'name' | 'category' | 'qty' | 'unit' | 'expiry' | 'location' | 'notes';
    const f = (k: FormKey) => ({ value: form[k], onChange: (v: string) => setForm(p => ({ ...p, [k]: v })) });

    // --- Image handling ---
    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) return `"${file.name}" is not a supported image type (PNG, JPG, WebP only)`;
        if (file.size > MAX_FILE_SIZE) return `"${file.name}" exceeds 5MB limit`;
        return null;
    };

    const addFiles = useCallback((files: FileList | File[]) => {
        const newFiles: File[] = [];
        const newPrevs: string[] = [];
        for (const file of Array.from(files)) {
            const err = validateFile(file);
            if (err) { setError(err); return; }
            if (imageFiles.length + newFiles.length >= 5) { setError('Maximum 5 photos allowed'); return; }
            newFiles.push(file);
            newPrevs.push(URL.createObjectURL(file));
        }
        setError('');
        setImageFiles(prev => [...prev, ...newFiles]);
        setPreviews(prev => [...prev, ...newPrevs]);
    }, [imageFiles.length]);

    const removeImage = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    }, [addFiles]);

    // --- Upload images to Supabase Storage ---
    const uploadImages = async (): Promise<string[]> => {
        if (imageFiles.length === 0) return [];
        const urls: string[] = [];
        for (const file of imageFiles) {
            const ext = file.name.split('.').pop();
            const path = `${profile?.id}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const { error: uploadError } = await supabase.storage.from('food-photos').upload(path, file, { upsert: false });
            if (uploadError) throw new Error(`Failed to upload "${file.name}": ${uploadError.message}`);
            const { data: urlData } = supabase.storage.from('food-photos').getPublicUrl(path);
            urls.push(urlData.publicUrl);
        }
        return urls;
    };

    // --- Submit ---
    const handleSubmit = async () => {
        if (!form.name || !form.category || !form.qty || !form.location) {
            setError('Please fill in all required fields');
            return;
        }
        setLoading(true);
        setError('');

        try {
            // Upload photos first
            const photoUrls = await uploadImages();

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
                photos: photoUrls,
            });

            if (insertError) {
                setError(insertError.message);
                setLoading(false);
            } else {
                // Clean up preview URLs
                previews.forEach(url => URL.revokeObjectURL(url));
                router.push('/donations');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong uploading photos');
            setLoading(false);
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

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            multiple
                            style={{ display: 'none' }}
                            onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
                        />

                        {/* Drop zone */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            style={{
                                border: `2px dashed ${dragOver ? C.greenForest : C.inputBorder}`,
                                borderRadius: 14,
                                padding: previews.length > 0 ? 16 : 32,
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: dragOver ? `${C.greenForest}08` : C.inputBg,
                                transition: 'border-color 0.2s, background 0.2s',
                            }}
                        >
                            {previews.length === 0 ? (
                                <>
                                    <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: C.greenDeep }}>Upload food photos</div>
                                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>PNG, JPG, WebP up to 5MB · Max 5 photos</div>
                                    <div style={{ marginTop: 12 }}><Btn size="sm" variant="secondary">Browse files</Btn></div>
                                </>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                                        {previews.map((src, i) => (
                                            <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 10, overflow: 'hidden', border: `2px solid ${C.inputBorder}` }}>
                                                <img src={src} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button
                                                    onClick={e => { e.stopPropagation(); removeImage(i); }}
                                                    style={{
                                                        position: 'absolute', top: 2, right: 2,
                                                        width: 20, height: 20, borderRadius: '50%',
                                                        background: 'rgba(0,0,0,0.6)', color: '#fff',
                                                        border: 'none', fontSize: 11, cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        lineHeight: 1,
                                                    }}
                                                >✕</button>
                                            </div>
                                        ))}
                                        {previews.length < 5 && (
                                            <div style={{
                                                width: 80, height: 80, borderRadius: 10,
                                                border: `2px dashed ${C.inputBorder}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 24, color: C.textMuted,
                                            }}>+</div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 10 }}>
                                        {previews.length}/5 photos · Click to add more
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.greenDeep, marginBottom: 14 }}>👁 Preview</h3>
                        <div style={{ padding: 14, borderRadius: 12, background: C.creamDark, border: `1px solid ${C.inputBorder}` }}>
                            {previews.length > 0 && (
                                <div style={{ marginBottom: 10, borderRadius: 8, overflow: 'hidden', maxHeight: 120 }}>
                                    <img src={previews[0]} alt="Preview" style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                                </div>
                            )}
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
                            {loading ? (imageFiles.length > 0 ? 'Uploading photos...' : 'Posting...') : 'Post Surplus Food 🌾'}
                        </Btn>
                    </Card>
                </div>
            </div>
        </div>
    );
}
