'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { C } from '@/lib/theme';
import { TopBar, Card, Btn, ProgressBar } from '@/components/ui';

export default function ReportsPage() {
    const { profile } = useAuth();
    const supabase = createClient();
    const [stats, setStats] = useState({ rescued: 0, pickups: 0, donors: 0, peopleFed: 0 });
    const [catData, setCatData] = useState<{ cat: string; count: number }[]>([]);
    const [monthData, setMonthData] = useState<number[]>(new Array(12).fill(0));

    useEffect(() => {
        if (!profile) return;
        const fetchReports = async () => {
            const { data: pickups } = await supabase
                .from('pickup_requests')
                .select('status, created_at, listing:food_listings(quantity, category)')
                .eq('ngo_id', profile.id);

            if (pickups) {
                const completed = pickups.filter(p => p.status === 'completed');
                const rescued = completed.reduce((sum, p) => {
                    const l = p.listing as unknown as { quantity: number } | null;
                    return sum + (l?.quantity || 0);
                }, 0);
                const uniqueDonors = new Set(pickups.map(p => (p as Record<string, unknown>).donor_id)).size;

                setStats({
                    rescued,
                    pickups: completed.length,
                    donors: uniqueDonors || 0,
                    peopleFed: Math.round(rescued * 2),
                });

                // Category breakdown
                const catMap: Record<string, number> = {};
                completed.forEach(p => {
                    const l = p.listing as unknown as { category: string; quantity: number } | null;
                    if (l) catMap[l.category] = (catMap[l.category] || 0) + l.quantity;
                });
                const total = Object.values(catMap).reduce((s, v) => s + v, 0) || 1;
                setCatData(Object.entries(catMap).map(([cat, count]) => ({ cat, count: Math.round((count / total) * 100) })).sort((a, b) => b.count - a.count));

                // Monthly aggregation from real data
                const monthly = new Array(12).fill(0);
                completed.forEach(p => {
                    const d = new Date((p as Record<string, unknown>).created_at as string);
                    const l = p.listing as unknown as { quantity: number } | null;
                    if (d.getFullYear() === new Date().getFullYear()) {
                        monthly[d.getMonth()] += l?.quantity || 0;
                    }
                });
                setMonthData(monthly);
            }
        };
        fetchReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    const exportCSV = () => {
        const rows = [
            ['FoodRescue Report'],
            [],
            ['Metric', 'Value'],
            ['Total Food Rescued (kg)', stats.rescued],
            ['Successful Pickups', stats.pickups],
            ['Donors Partnered', stats.donors],
            ['People Fed (est.)', stats.peopleFed],
            [],
            ['Category', 'Percentage'],
            ...catData.map(c => [c.cat, `${c.count}%`]),
            [],
            ['Month', 'Food Rescued (kg)'],
            ...months.map((m, i) => [m, monthData[i]]),
        ];
        const csv = rows.map(r => (r as (string | number)[]).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `foodrescue-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const maxVal = Math.max(...monthData, 1);
    const currentMonth = new Date().getMonth();

    const catColors = [C.greenForest, C.earthBrown, C.warning, C.greenLeaf, C.success, C.danger];

    const topStats = [
        { label: 'Total Food Rescued', val: `${stats.rescued} kg`, icon: '⚖️', delta: 'All time', color: C.greenForest },
        { label: 'Successful Pickups', val: `${stats.pickups}`, icon: '✅', delta: 'Completed', color: C.success },
        { label: 'Donors Partnered', val: `${stats.donors}`, icon: '🤝', delta: 'Unique donors', color: C.earthBrown },
        { label: 'People Fed (est.)', val: `${stats.peopleFed}`, icon: '👥', delta: 'Based on 0.5kg/person', color: C.greenLeaf },
    ];

    return (
        <div className="anim">
            <TopBar title="Reports & Analytics" subtitle="Track your food rescue impact" actions={<Btn variant="secondary" size="sm" onClick={exportCSV}>📥 Export Report</Btn>} />

            <div className="dash-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {topStats.map(s => (
                    <Card key={s.label}>
                        <div style={{ fontSize: 26 }}>{s.icon}</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: C.greenDeep, marginTop: 6 }}>{s.val}</div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: s.color, marginTop: 4 }}>{s.delta}</div>
                    </Card>
                ))}
            </div>

            <div className="reports-chart-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
                <Card>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: C.greenDeep, marginBottom: 20 }}>📊 Monthly Food Rescued (kg)</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
                        {months.map((m, i) => (
                            <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <div style={{
                                    width: '100%',
                                    background: i === currentMonth ? C.greenForest : `${C.greenForest}40`,
                                    borderRadius: '4px 4px 0 0',
                                    height: `${(monthData[i] / maxVal) * 140}px`,
                                    transition: 'height .5s ease',
                                }} />
                                <span style={{ fontSize: 9, color: C.textLight }}>{m}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Card>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.greenDeep, marginBottom: 14 }}>🥗 Food by Category</h3>
                        {catData.length === 0 ? (
                            <p style={{ fontSize: 12, color: C.textMuted }}>No data yet. Complete pickups to see category breakdown.</p>
                        ) : (
                            catData.map((c, i) => (
                                <div key={c.cat} style={{ marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                        <span style={{ color: C.greenDeep }}>{c.cat}</span>
                                        <span style={{ color: C.textMuted }}>{c.count}%</span>
                                    </div>
                                    <ProgressBar value={c.count} max={100} color={catColors[i % catColors.length]} height={6} />
                                </div>
                            ))
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
