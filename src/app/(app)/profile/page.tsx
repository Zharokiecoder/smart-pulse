'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { C } from '@/lib/theme';
import { TopBar, Card, Btn, Inp, Badge } from '@/components/ui';

export default function ProfilePage() {
    const { profile, signOut, refreshProfile } = useAuth();
    const router = useRouter();
    const supabase = createClient();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(profile?.full_name || '');
    const [org, setOrg] = useState(profile?.org_name || '');
    const [location, setLocation] = useState(profile?.location || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [bio, setBio] = useState(profile?.bio || '');
    const [saving, setSaving] = useState(false);

    const isDonor = profile?.role === 'donor';

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        await supabase.from('profiles').update({
            full_name: name,
            org_name: org,
            location,
            phone,
            bio,
        }).eq('id', profile.id);
        await refreshProfile();
        setEditing(false);
        setSaving(false);
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    const initials = (profile?.full_name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="anim">
            <TopBar title="Profile" subtitle="Manage your account and preferences" />
            <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Card style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%',
                                background: `linear-gradient(135deg, ${C.greenForest}, ${C.greenLeaf})`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 36, color: '#fff', fontWeight: 700,
                            }}>{initials}</div>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: C.greenDeep }}>{profile?.full_name}</div>
                        <div style={{ fontSize: 13, color: C.textMuted }}>{profile?.org_name}</div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                            <Badge color={isDonor ? C.greenForest : C.earthBrown}>{isDonor ? '🌾 Food Donor' : '🤝 NGO'}</Badge>
                        </div>
                        {profile?.verified && <div style={{ marginTop: 12 }}><Badge color={C.success}>✓ Verified</Badge></div>}
                        <Btn full variant="secondary" size="sm" style={{ marginTop: 16 }} onClick={() => setEditing(e => !e)}>
                            {editing ? 'Cancel' : 'Edit Profile'}
                        </Btn>
                    </Card>

                    <Card>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: C.greenDeep, marginBottom: 12 }}>📊 Your Stats</h3>
                        <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
                            Stats are calculated from your activity on FoodRescue. Keep using the platform to see your impact grow!
                        </p>
                    </Card>
                </div>

                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.greenDeep }}>Account Information</h3>
                        {editing && <Btn size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes ✓'}</Btn>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <Inp label="Full Name" value={name} onChange={setName} icon="👤"
                            style={editing ? {} : { background: 'transparent', border: 'none' }} disabled={!editing} />
                        <Inp label={isDonor ? 'Farm / Business Name' : 'Organisation Name'} value={org} onChange={setOrg} icon={isDonor ? '🌾' : '🏢'}
                            style={editing ? {} : { background: 'transparent', border: 'none' }} disabled={!editing} />
                        <Inp label="Location" value={location} onChange={setLocation} icon="📍"
                            style={editing ? {} : { background: 'transparent', border: 'none' }} disabled={!editing} />
                        <Inp label="Phone Number" value={phone} onChange={setPhone} icon="📞"
                            style={editing ? {} : { background: 'transparent', border: 'none' }} disabled={!editing} />
                        <Inp label="Bio" value={bio} onChange={setBio} icon="📝" multiline rows={3}
                            style={editing ? {} : { background: 'transparent', border: 'none' }} disabled={!editing} />
                    </div>

                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.creamDark}` }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: C.greenDeep, marginBottom: 12 }}>🔔 Account Settings</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ fontSize: 13, color: C.textMuted, padding: '8px 0' }}>Email: {profile?.email}</div>
                            <div style={{ fontSize: 13, color: C.textMuted, padding: '8px 0' }}>Role: {isDonor ? 'Food Donor' : 'NGO / Food Bank'}</div>
                            <div style={{ fontSize: 13, color: C.textMuted, padding: '8px 0' }}>Member since: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: 16 }}>
                        <Btn variant="danger" size="sm" onClick={handleSignOut}>Sign Out</Btn>
                    </div>
                </Card>
            </div>
        </div>
    );
}
