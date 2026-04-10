'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/lib/theme';

export default function LandingPage() {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div style={{ background: C.creamBg, color: C.greenDeep, fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>
      {/* NAVBAR */}
      <nav className="nav-bar" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: `${C.creamBg}e8`, backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.creamDark}60`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: `linear-gradient(135deg, ${C.greenForest}, ${C.greenLeaf})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🍃</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 }}>FoodRescue</span>
        </div>
        <div className="nav-links" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {['How it Works', 'Impact', 'About'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} style={{ fontSize: 14, color: C.textMuted, textDecoration: 'none', fontWeight: 400, transition: 'color .2s' }}
              onMouseEnter={e => e.currentTarget.style.color = C.greenForest}
              onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
            >{item}</a>
          ))}
          <button onClick={() => router.push('/login')} style={{
            padding: '9px 20px', borderRadius: 10, border: `1.5px solid ${C.greenForest}40`,
            background: 'transparent', color: C.greenForest, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>Sign In</button>
          <button onClick={() => router.push('/register')} style={{
            padding: '9px 22px', borderRadius: 10, border: 'none',
            background: C.greenForest, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            boxShadow: `0 4px 16px ${C.greenForest}30`,
          }}>Get Started</button>
        </div>
        <button className="nav-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`nav-mobile-menu ${menuOpen ? 'open' : ''}`}>
        <button className="nav-mobile-toggle" onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: 18, right: 24 }} aria-label="Close menu">✕</button>
        {['How it Works', 'Impact', 'About'].map(item => (
          <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
            onClick={() => setMenuOpen(false)}
            style={{ fontSize: 20, color: C.greenDeep, textDecoration: 'none', fontWeight: 500 }}
          >{item}</a>
        ))}
        <button onClick={() => { setMenuOpen(false); router.push('/login'); }} style={{
          padding: '12px 32px', borderRadius: 12, border: `1.5px solid ${C.greenForest}40`,
          background: 'transparent', color: C.greenForest, fontSize: 16, fontWeight: 500, cursor: 'pointer',
        }}>Sign In</button>
        <button onClick={() => { setMenuOpen(false); router.push('/register'); }} style={{
          padding: '12px 32px', borderRadius: 12, border: 'none',
          background: C.greenForest, color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer',
        }}>Get Started</button>
      </div>

      {/* HERO */}
      <section className="hero-section" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '120px 48px 80px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background orbs */}
        {[
          { w: 500, h: 500, t: '-15%', r: '-10%', c: C.greenForest, o: 0.12 },
          { w: 350, h: 350, b: '5%', l: '-8%', c: C.greenLeaf, o: 0.1 },
          { w: 200, h: 200, t: '35%', l: '55%', c: C.earthBrown, o: 0.08 },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute', width: b.w, height: b.h, borderRadius: '50%',
            background: `radial-gradient(circle, ${b.c}${Math.round(b.o * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
            top: b.t, right: b.r, bottom: b.b, left: b.l,
            animation: 'float 8s ease-in-out infinite',
          }} />
        ))}

        <div className="hero-grid" style={{
          position: 'relative', zIndex: 2, maxWidth: 1100, width: '100%',
          display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 60, alignItems: 'center',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 1s cubic-bezier(.16,1,.3,1)',
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 30, background: `${C.greenForest}12`, marginBottom: 24 }}>
              <span style={{ fontSize: 14 }}>🌱</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.greenForest, letterSpacing: '0.04em' }}>FIGHTING FOOD WASTE TOGETHER</span>
            </div>
            <h1 className="hero-heading" style={{
              fontFamily: "'Playfair Display', serif", fontSize: 64, fontWeight: 900,
              lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 24,
            }}>
              From <em style={{ color: C.greenForest, fontStyle: 'normal', position: 'relative' }}>Surplus</em><br />
              to <em style={{ color: C.greenLeaf, fontStyle: 'normal' }}>Sustenance</em>.
            </h1>
            <p className="hero-desc" style={{ fontSize: 17, color: C.textMuted, lineHeight: 1.7, maxWidth: 480, marginBottom: 36, fontWeight: 300 }}>
              FoodRescue connects food donors — farmers, restaurants, retailers — with NGOs and food banks.
              Together, we rescue surplus food and feed communities.
            </p>
            <div className="hero-buttons" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <button onClick={() => router.push('/register')} style={{
                padding: '15px 32px', borderRadius: 14, border: 'none',
                background: `linear-gradient(135deg, ${C.greenForest}, ${C.greenLeaf})`,
                color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                boxShadow: `0 8px 32px ${C.greenForest}40`,
                transition: 'transform .2s, box-shadow .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${C.greenForest}50`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 32px ${C.greenForest}40`; }}
              >Start Rescuing Food →</button>
              <button onClick={() => router.push('/login')} style={{
                padding: '15px 28px', borderRadius: 14,
                border: `2px solid ${C.greenForest}30`, background: 'transparent',
                color: C.greenForest, fontSize: 15, fontWeight: 500, cursor: 'pointer',
              }}>Sign In</button>
            </div>
          </div>

          {/* Hero visual */}
          <div className="hero-visual" style={{ position: 'relative' }}>
            <div style={{
              width: '100%', aspectRatio: '1', borderRadius: 32,
              background: `linear-gradient(135deg, ${C.greenDeep}, ${C.greenForest})`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 16, position: 'relative', overflow: 'hidden',
              boxShadow: `0 24px 80px ${C.greenDeep}30`,
            }}>
              <div style={{ fontSize: 80, animation: 'float 4s ease-in-out infinite' }}>🍃</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#E8F0E3' }}>Every Meal Matters</div>
                <div style={{ fontSize: 13, color: '#8BA88C', marginTop: 6 }}>Connecting donors with those in need</div>
              </div>
              {/* Floating cards */}
              {[
                { emoji: '🥬', label: '20 kg Vegetables', pos: { bottom: 50, left: -20 }, delay: '0s' },
                { emoji: '🍞', label: '15 boxes Bakery', pos: { top: 30, right: -20 }, delay: '1.5s' },
              ].map((card, i) => (
                <div key={i} style={{
                  position: 'absolute', ...card.pos,
                  background: '#fff', borderRadius: 14, padding: '10px 16px',
                  boxShadow: '0 8px 32px #00000015', display: 'flex', alignItems: 'center', gap: 10,
                  animation: `float 5s ease-in-out infinite`, animationDelay: card.delay,
                }}>
                  <span style={{ fontSize: 24 }}>{card.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: C.greenDeep }}>{card.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="stats-bar" style={{
        padding: '40px 48px', background: C.greenDeep,
        display: 'flex', justifyContent: 'center', gap: 80,
      }}>
        {[
          { val: '2,400+', label: 'Donations Made', emoji: '📦' },
          { val: '180+', label: 'Partner NGOs', emoji: '🤝' },
          { val: '12 Tons', label: 'Food Rescued', emoji: '⚖️' },
          { val: '8,000+', label: 'People Fed', emoji: '👥' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, marginBottom: 6 }}>{s.emoji}</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: C.greenLeaf }}>{s.val}</div>
            <div style={{ fontSize: 12, color: '#8BA88C', marginTop: 4, letterSpacing: '0.04em' }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="steps-section" style={{ padding: '100px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.greenForest, letterSpacing: '0.1em', textTransform: 'uppercase' }}>How it Works</span>
          <h2 className="steps-heading" style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 800, marginTop: 12, letterSpacing: '-1px' }}>
            Three steps to <em style={{ color: C.greenForest, fontStyle: 'normal' }}>rescue food</em>
          </h2>
        </div>
        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
          {[
            { step: '01', icon: '📋', title: 'List Surplus Food', desc: 'Donors post available surplus food — fresh produce, bakery, cooked meals — with quantity, location, and expiry details.', color: C.greenForest },
            { step: '02', icon: '🔍', title: 'NGOs Browse & Claim', desc: 'Nearby NGOs and food banks browse available listings, filter by category, and request pickup for what they need.', color: C.greenLeaf },
            { step: '03', icon: '🚚', title: 'Schedule & Collect', desc: 'Pickup is scheduled at a convenient time. Food moves from surplus to sustenance — directly feeding communities.', color: C.earthBrown },
          ].map(s => (
            <div key={s.step} style={{
              padding: 32, borderRadius: 24, background: C.creamCard,
              border: `1px solid ${C.creamDark}`, position: 'relative', overflow: 'hidden',
              transition: 'transform .3s, box-shadow .3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 48px #00000012'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: `${s.color}60`, letterSpacing: '0.1em', marginBottom: 16 }}>STEP {s.step}</div>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 20 }}>{s.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: C.greenDeep }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOR DONORS & NGOs */}
      <section id="about" className="who-section" style={{ padding: '80px 48px', background: `${C.greenDeep}08` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.greenForest, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Who It&apos;s For</span>
            <h2 className="who-heading" style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 800, marginTop: 12, letterSpacing: '-1px' }}>
              One platform, <em style={{ color: C.greenForest, fontStyle: 'normal' }}>two missions</em>
            </h2>
          </div>
          <div className="who-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            {[
              {
                icon: '🌾', title: 'For Food Donors',
                desc: 'Farmers, restaurants, retailers, and caterers with surplus food that would otherwise go to waste.',
                features: ['Post surplus in 60 seconds', 'Track all your donations', 'Accept pickups on your schedule', 'See your impact grow'],
                color: C.greenForest, bg: `linear-gradient(135deg, ${C.greenDeep}, ${C.greenForest})`,
              },
              {
                icon: '🤝', title: 'For NGOs & Food Banks',
                desc: 'Organizations working to distribute food to communities, shelters, and those in need.',
                features: ['Browse food near you', 'Schedule pickups easily', 'Track collection history', 'Generate impact reports'],
                color: C.earthBrown, bg: `linear-gradient(135deg, ${C.earthBrown}, #A88B5E)`,
              },
            ].map(card => (
              <div key={card.title} style={{
                padding: 36, borderRadius: 24, background: card.bg, color: '#fff',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: '#ffffff08' }} />
                <div style={{ fontSize: 40, marginBottom: 16 }}>{card.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 10 }}>{card.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.65, opacity: 0.8, marginBottom: 24 }}>{card.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {card.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: '#ffffff20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>✓</div>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section id="impact" className="impact-section" style={{ padding: '100px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="impact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.greenForest, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Our Impact</span>
            <h2 className="impact-heading" style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 800, marginTop: 12, letterSpacing: '-1px', marginBottom: 20 }}>
              Reducing waste,<br /><em style={{ color: C.greenForest, fontStyle: 'normal' }}>feeding hope</em>
            </h2>
            <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.7, marginBottom: 32 }}>
              Every kilogram of food rescued is a meal that reaches someone in need. Our platform has helped
              donors and NGOs work together to make a real difference in their communities.
            </p>
            <div className="impact-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { val: '99%', label: 'Pickup success rate' },
                { val: '< 4hrs', label: 'Avg. response time' },
                { val: '45+', label: 'Cities covered' },
                { val: '0 kg', label: 'Target food waste' },
              ].map(s => (
                <div key={s.label} style={{ padding: 16, borderRadius: 14, background: C.creamCard, border: `1px solid ${C.creamDark}` }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: C.greenForest }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{
            aspectRatio: '1', borderRadius: 28, background: `linear-gradient(135deg, ${C.greenForest}15, ${C.greenLeaf}20)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20,
            border: `1px solid ${C.greenForest}20`,
          }}>
            <div style={{ fontSize: 80 }}>🌍</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: C.greenDeep }}>Zero Food Waste</div>
            <div style={{ fontSize: 14, color: C.textMuted }}>That&apos;s the future we&apos;re building</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" style={{
        padding: '80px 48px', margin: '0 48px 60px', borderRadius: 32,
        background: `linear-gradient(135deg, ${C.greenDeep}, ${C.greenForest})`,
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: '#ffffff08' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: '#ffffff06' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
          <h2 className="cta-heading" style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 800, color: '#E8F0E3', marginBottom: 16 }}>
            Ready to make a difference?
          </h2>
          <p className="cta-desc" style={{ fontSize: 16, color: '#8BA88C', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Whether you&apos;re a donor with surplus food or an NGO feeding communities, FoodRescue connects you.
          </p>
          <div className="cta-buttons" style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
            <button onClick={() => router.push('/register')} style={{
              padding: '16px 36px', borderRadius: 14, border: 'none',
              background: '#fff', color: C.greenForest, fontSize: 16, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 8px 32px #00000020',
            }}>Join FoodRescue →</button>
            <button onClick={() => router.push('/login')} style={{
              padding: '16px 32px', borderRadius: 14,
              border: '2px solid #ffffff30', background: 'transparent',
              color: '#E8F0E3', fontSize: 16, fontWeight: 500, cursor: 'pointer',
            }}>Sign In</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer" style={{
        padding: '48px 48px 32px', borderTop: `1px solid ${C.creamDark}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        maxWidth: 1100, margin: '0 auto',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${C.greenForest}, ${C.greenLeaf})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🍃</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>FoodRescue</span>
          </div>
          <p style={{ fontSize: 13, color: C.textMuted, maxWidth: 280, lineHeight: 1.6 }}>
            From surplus to sustenance. Building a world where no food goes to waste.
          </p>
        </div>
        <div className="footer-links" style={{ display: 'flex', gap: 48 }}>
          {[
            { title: 'Platform', links: ['How it Works', 'For Donors', 'For NGOs', 'Browse Food'] },
            { title: 'Company', links: ['About Us', 'Contact', 'Blog', 'Careers'] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.greenDeep, marginBottom: 14 }}>{col.title}</div>
              {col.links.map(l => (
                <div key={l} style={{ fontSize: 13, color: C.textMuted, marginBottom: 8, cursor: 'pointer' }}>{l}</div>
              ))}
            </div>
          ))}
        </div>
      </footer>
      <div className="footer-copyright" style={{ padding: '16px 48px', textAlign: 'center', fontSize: 12, color: C.textLight, borderTop: `1px solid ${C.creamDark}` }}>
        © 2026 FoodRescue. All rights reserved. Built with 💚
      </div>
    </div>
  );
}
