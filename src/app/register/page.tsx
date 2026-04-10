'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { C } from '@/lib/theme';
import { Btn, Inp } from '@/components/ui';

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<'donor' | 'ngo'>('donor');
    const [name, setName] = useState('');
    const [org, setOrg] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async () => {
        setError('');
        if (!name || !email || !pass) {
            setError('Please fill in all required fields');
            return;
        }
        if (pass.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: {
                data: {
                    full_name: name,
                    role,
                    org_name: org,
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Update profile with org name
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').update({
                    full_name: name,
                    org_name: org,
                    role,
                }).eq('id', user.id);
            }
            router.push('/dashboard');
            router.refresh();
        }
    };

    const handleGoogleSignup = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    return (
        <div className="auth-page" style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Left Panel */}
            <div className="auth-left-panel" style={{ width: '42%', background: C.greenDeep, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                {[
                    { w: 350, h: 350, t: '-80px', r: '-80px', c: C.greenForest, o: 0.5 },
                    { w: 250, h: 250, b: '60px', l: '-60px', c: C.greenLeaf, o: 0.3 },
                ].map((b, i) => (
                    <div key={i} style={{
                        position: 'absolute', width: b.w, height: b.h, borderRadius: '50%',
                        background: `radial-gradient(circle, ${b.c}${Math.round(b.o * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
                        top: b.t, right: b.r, bottom: b.b, left: b.l,
                    }} />
                ))}
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', padding: '40px 44px', gap: 32, flex: 1, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${C.greenForest}, ${C.greenLeaf})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🍃</div>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#E8F0E3' }}>FoodRescue</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 46, fontWeight: 900, color: '#E8F0E3', lineHeight: 1.15 }}>
                            Every meal<br /><em style={{ color: C.greenLeaf, fontStyle: 'normal' }}>rescued</em><br />matters.
                        </h1>
                        <p style={{ fontSize: 15, color: '#8BA88C', lineHeight: 1.65, fontWeight: 300, maxWidth: 300 }}>
                            Join donors, NGOs, and food banks working together to eliminate food waste.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 24 }}>
                        {[['2,400+', 'Donations'], ['180+', 'NGOs'], ['12 tons', 'Rescued']].map(([n, l]) => (
                            <div key={l}>
                                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.greenLeaf }}>{n}</div>
                                <div style={{ fontSize: 11, color: '#6B8A6C', letterSpacing: '0.05em' }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Register Form */}
            <div className="auth-right-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                <div style={{ width: '100%', maxWidth: 440, background: C.creamCard, borderRadius: 24, boxShadow: '0 8px 48px #00000010', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', background: C.creamDark, padding: 6 }}>
                        <button onClick={() => router.push('/login')} style={{ flex: 1, padding: '11px 0', border: 'none', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: 'transparent', color: C.textMuted, fontWeight: 400, cursor: 'pointer' }}>
                            Sign In
                        </button>
                        <button style={{ flex: 1, padding: '11px 0', border: 'none', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: C.creamCard, color: C.greenDeep, fontWeight: 600, boxShadow: '0 2px 8px #00000010' }}>
                            Create Account
                        </button>
                    </div>
                    <div style={{ padding: '28px 32px 32px' }} className="anim">
                        {error && (
                            <div style={{ padding: '10px 14px', borderRadius: 12, background: C.dangerBg, border: `1px solid ${C.danger}30`, fontSize: 13, color: C.danger, marginBottom: 16 }}>
                                {error}
                            </div>
                        )}

                        {step === 1 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: C.greenDeep }}>Join FoodRescue 🌱</h2>
                                    <p style={{ fontSize: 13, color: C.textMuted, marginTop: 3 }}>First, tell us who you are</p>
                                </div>
                                {[
                                    { id: 'donor' as const, emoji: '🌾', label: 'Food Donor', desc: 'Farmer, restaurant, or retailer with surplus food' },
                                    { id: 'ngo' as const, emoji: '🤝', label: 'NGO / Food Bank', desc: 'Organization that collects and distributes food' },
                                ].map(r => (
                                    <div key={r.id} onClick={() => setRole(r.id)} style={{
                                        padding: 16, borderRadius: 16, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', position: 'relative',
                                        border: role === r.id ? `2px solid ${C.greenForest}` : `1.5px solid ${C.inputBorder}`,
                                        background: role === r.id ? `${C.greenForest}0e` : C.creamCard,
                                    }}>
                                        <div style={{ width: 52, height: 52, borderRadius: 14, background: role === r.id ? `${C.greenForest}18` : C.creamDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{r.emoji}</div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: C.greenDeep }}>{r.label}</div>
                                            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{r.desc}</div>
                                        </div>
                                        {role === r.id && (
                                            <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', background: C.greenForest, color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                                        )}
                                    </div>
                                ))}
                                <Btn full onClick={() => setStep(2)}>Continue as {role === 'donor' ? 'Food Donor' : 'NGO'} →</Btn>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ flex: 1, height: 1, background: C.inputBorder }} />
                                    <span style={{ fontSize: 12, color: C.textLight }}>or</span>
                                    <div style={{ flex: 1, height: 1, background: C.inputBorder }} />
                                </div>
                                <Btn full variant="outline" onClick={handleGoogleSignup}>
                                    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                    Continue with Google
                                </Btn>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 13, textAlign: 'left', padding: 0, cursor: 'pointer' }}>← Back</button>
                                <div>
                                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: C.greenDeep }}>Create your account</h2>
                                </div>
                                <Inp label="Full Name" placeholder="John Adamu" value={name} onChange={setName} icon="👤" />
                                <Inp label={role === 'ngo' ? 'Organisation Name' : 'Farm / Business Name'} placeholder={role === 'ngo' ? 'Lagos Food Bank' : 'Green Valley Farm'} value={org} onChange={setOrg} icon={role === 'ngo' ? '🏢' : '🌾'} />
                                <Inp label="Email address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} icon="✉️" />
                                <Inp label="Password" type="password" placeholder="Min. 8 characters" value={pass} onChange={setPass} icon="🔒" />
                                {role === 'ngo' && (
                                    <div style={{ display: 'flex', gap: 8, padding: 12, borderRadius: 12, background: C.warningBg, border: `1px solid ${C.warningBorder}`, fontSize: 13, color: C.warning }}>
                                        <span>🔍</span>
                                        <span>NGO accounts are reviewed within 24 hrs before activation.</span>
                                    </div>
                                )}
                                <Btn full onClick={handleRegister} disabled={loading}>
                                    {loading ? 'Creating account...' : 'Create Account →'}
                                </Btn>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
