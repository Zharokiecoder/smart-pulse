'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { C } from '@/lib/theme';
import { TopBar, Btn, Avatar } from '@/components/ui';

interface Conversation {
    id: string;
    participant_1: string;
    participant_2: string;
    last_message: string;
    last_message_at: string;
    other_user?: { full_name: string; org_name: string; role: string };
}

interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    text: string;
    read: boolean;
    created_at: string;
}

export default function MessagesPage() {
    const { profile } = useAuth();
    const supabase = createClient();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [active, setActive] = useState<string | null>(null);
    const [mobileShowChat, setMobileShowChat] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [msg, setMsg] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!profile) return;
        const fetchConversations = async () => {
            try {
                const { data } = await supabase
                    .from('conversations')
                    .select('*')
                    .or(`participant_1.eq.${profile.id},participant_2.eq.${profile.id}`)
                    .order('last_message_at', { ascending: false });

                if (data) {
                    // Fetch other users' profiles
                    const enriched = await Promise.all(data.map(async (conv) => {
                        const otherId = conv.participant_1 === profile.id ? conv.participant_2 : conv.participant_1;
                        const { data: otherUser } = await supabase.from('profiles').select('full_name, org_name, role').eq('id', otherId).single();
                        return { ...conv, other_user: otherUser || undefined };
                    }));
                    setConversations(enriched);
                    if (enriched.length > 0 && !active) setActive(enriched[0].id);
                }
            } catch {
                // Fetch failed
            }
        };
        fetchConversations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    useEffect(() => {
        if (!active) return;
        const fetchMessages = async () => {
            try {
                const { data } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', active)
                    .order('created_at', { ascending: true });
                if (data) setMessages(data);
            } catch {
                // Fetch failed
            }
        };
        fetchMessages();

        // Real-time subscription
        const channel = supabase
            .channel(`messages:${active}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${active}` },
                (payload) => {
                    setMessages(prev => [...prev, payload.new as Message]);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async () => {
        if (!msg.trim() || !active || !profile) return;
        const text = msg.trim();
        setMsg('');

        await supabase.from('messages').insert({
            conversation_id: active,
            sender_id: profile.id,
            text,
        });

        await supabase.from('conversations').update({
            last_message: text,
            last_message_at: new Date().toISOString(),
        }).eq('id', active);
    };

    const activeConv = conversations.find(c => c.id === active);
    const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const timeAgo = (d: string) => {
        const diff = Date.now() - new Date(d).getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div className="anim">
            <TopBar title="Messages" subtitle="In-app communication with donors & NGOs" />
            <div className="msg-container" style={{
                display: 'grid', gridTemplateColumns: '300px 1fr', gap: 0, background: C.creamCard, borderRadius: 20,
                overflow: 'hidden', border: `1px solid ${C.creamDark}`, height: 'calc(100vh - 200px)', minHeight: 500,
            }}>
                {/* Conversation List */}
                <div className={`msg-list ${!mobileShowChat ? 'msg-list-visible' : ''}`} style={{ borderRight: `1px solid ${C.creamDark}`, overflow: 'auto' }}>
                    <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${C.creamDark}` }}>
                        <input placeholder="Search..." style={{ width: '100%', padding: '9px 14px', border: `1.5px solid ${C.inputBorder}`, borderRadius: 10, fontSize: 13, background: C.inputBg }} />
                    </div>
                    {conversations.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: C.textMuted }}>No conversations yet</div>
                    ) : (
                        conversations.map(c => (
                            <div key={c.id} onClick={() => { setActive(c.id); setMobileShowChat(true); }} style={{
                                display: 'flex', gap: 12, alignItems: 'center', padding: '14px 16px', cursor: 'pointer',
                                background: active === c.id ? `${C.greenForest}0e` : 'transparent',
                                borderBottom: `1px solid ${C.creamDark}99`,
                            }}>
                                <Avatar name={c.other_user?.org_name || c.other_user?.full_name || '?'} size={40} bg={c.other_user?.role === 'ngo' ? C.greenForest : C.earthBrown} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: C.greenDeep }}>{c.other_user?.org_name || c.other_user?.full_name}</div>
                                    <div style={{ fontSize: 11, color: C.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.last_message}</div>
                                </div>
                                <span style={{ fontSize: 10, color: C.textLight, flexShrink: 0 }}>{timeAgo(c.last_message_at)}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Chat Area */}
                <div className={`msg-chat ${mobileShowChat ? 'msg-chat-visible' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
                    {activeConv ? (
                        <>
                            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.creamDark}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <button className="msg-back-btn" onClick={() => setMobileShowChat(false)} style={{ display: 'none', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: C.greenForest, padding: '0 4px' }}>←</button>
                                <Avatar name={activeConv.other_user?.org_name || activeConv.other_user?.full_name || '?'} size={36} bg={activeConv.other_user?.role === 'ngo' ? C.greenForest : C.earthBrown} />
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: C.greenDeep }}>{activeConv.other_user?.org_name || activeConv.other_user?.full_name}</div>
                                    <div style={{ fontSize: 11, color: C.success }}>● Online</div>
                                </div>
                            </div>
                            <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {messages.map(m => (
                                    <div key={m.id} style={{ display: 'flex', justifyContent: m.sender_id === profile?.id ? 'flex-end' : 'flex-start' }}>
                                        <div style={{
                                            maxWidth: '70%', padding: '10px 14px',
                                            borderRadius: m.sender_id === profile?.id ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            background: m.sender_id === profile?.id ? C.greenForest : C.creamDark,
                                            color: m.sender_id === profile?.id ? '#fff' : C.greenDeep,
                                            fontSize: 13, lineHeight: 1.5,
                                        }}>
                                            {m.text}
                                            <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>{formatTime(m.created_at)}</div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.creamDark}`, display: 'flex', gap: 10 }}>
                                <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message..." style={{
                                    flex: 1, padding: '10px 14px', border: `1.5px solid ${C.inputBorder}`, borderRadius: 12, fontSize: 14, background: C.inputBg,
                                }} />
                                <Btn onClick={send}>Send →</Btn>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: 14 }}>
                            Select a conversation to start chatting
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
