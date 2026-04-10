'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { C } from '@/lib/theme';
import { Btn, Inp } from '@/components/ui';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async () => {
        setError('');
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/dashboard');
            router.refresh();
        }
    };

    const handleGoogleLogin = async () => {
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
                        position: 'absolute',
                        width: b.w,
                        height: b.h,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${b.c}${Math.round(b.o * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
                        top: b.t,
                        right: b.r,
                        bottom: b.b,
                        left: b.l,
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

            {/* Right Panel - Login Form */}
            <div className="auth-right-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                <div style={{ width: '100%', maxWidth: 440, background: C.creamCard, borderRadius: 24, boxShadow: '0 8px 48px #00000010', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', background: C.creamDark, padding: 6 }}>
                        <button style={{ flex: 1, padding: '11px 0', border: 'none', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: C.creamCard, color: C.greenDeep, fontWeight: 600, boxShadow: '0 2px 8px #00000010' }}>
                            Sign In
                        </button>
                        <button onClick={() => router.push('/register')} style={{ flex: 1, padding: '11px 0', border: 'none', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: 'transparent', color: C.textMuted, fontWeight: 400, cursor: 'pointer' }}>
                            Create Account
                        </button>
                    </div>
                    <div style={{ padding: '28px 32px 32px' }} className="anim">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: C.greenDeep }}>Welcome back 👋</h2>
                                <p style={{ fontSize: 13, color: C.textMuted, marginTop: 3 }}>Sign in to your FoodRescue account</p>
                            </div>

                            {error && (
                                <div style={{ padding: '10px 14px', borderRadius: 12, background: C.dangerBg, border: `1px solid ${C.danger}30`, fontSize: 13, color: C.danger }}>
                                    {error}
                                </div>
                            )}

                            <Inp label="Email address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} icon="✉️" />

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: C.greenDeep }}>Password</label>
                                    <button style={{ background: 'none', border: 'none', color: C.greenForest, fontSize: 12 }}>Forgot password?</button>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔒</span>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={pass}
                                        onChange={e => setPass(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                        style={{ width: '100%', padding: '12px 44px 12px 40px', border: `1.5px solid ${C.inputBorder}`, borderRadius: 12, fontSize: 14, background: C.inputBg, color: C.greenDeep }}
                                    />
                                    <button onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: 16 }}>
                                        {showPass ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <Btn full onClick={handleLogin} disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign In →'}
                            </Btn>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ flex: 1, height: 1, background: C.inputBorder }} />
                                <span style={{ fontSize: 12, color: C.textLight }}>or</span>
                                <div style={{ flex: 1, height: 1, background: C.inputBorder }} />
                            </div>

                            <Btn full variant="outline" onClick={handleGoogleLogin}>
                                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                Continue with Google
                            </Btn>

                            <p style={{ textAlign: 'center', fontSize: 13, color: C.textMuted }}>
                                Don&apos;t have an account?{' '}
                                <button onClick={() => router.push('/register')} style={{ background: 'none', border: 'none', color: C.greenForest, fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>
                                    Create one
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
