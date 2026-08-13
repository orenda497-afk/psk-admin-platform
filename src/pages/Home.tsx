import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greetWord = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const storedUser = (() => { try { const s = localStorage.getItem('psk_user'); return s ? JSON.parse(s) : null } catch { return null } })()
  const firstName = storedUser?.name ? storedUser.name.split(' ')[0] : ''
  const greeting = firstName ? `${greetWord}, ${firstName}` : greetWord

  const [stats, setStats] = useState({ available:0, onHire:0, inService:0, pickups:0, returns:0, quotes:0, mpesa:0, reminders:0 })

  useEffect(() => {
    async function loadStats() {
      const [v, b, r, d, mp] = await Promise.all([
        supabase.from('vehicles').select('status'),
        supabase.from('bookings').select('pickup_date, return_date, status'),
        supabase.from('reminders').select('id').eq('resolved', false),
        supabase.from('psk_documents').select('id').eq('doc_type', 'quotation').eq('status', 'draft'),
        supabase.from('mpesa_transactions').select('id').eq('matched', false),
      ])
      const today = new Date().toISOString().split('T')[0]
      const vehicles = v.data || []
      const bookings = b.data || []
      setStats({
        available:  vehicles.filter((x:any) => x.status === 'available').length,
        onHire:     vehicles.filter((x:any) => ['chauffeured','safari','self-drive','airport'].includes(x.status)).length,
        inService:  vehicles.filter((x:any) => x.status === 'service').length,
        pickups:    bookings.filter((x:any) => x.pickup_date?.startsWith(today)).length,
        returns:    bookings.filter((x:any) => x.return_date?.startsWith(today)).length,
        quotes:     (d.data || []).length,
        mpesa:      (mp.data || []).length,
        reminders:  (r.data || []).length,
      })
    }
    loadStats()
  }, [])

  const categories = [
    {
      id: 'operations',
      title: 'Operations',
      subtitle: 'Daily fleet & booking management',
      accent: 'linear-gradient(90deg, #FF9500, #FFD700)',
      borderColor: 'rgba(255,149,0,0.32)',
      glowColor: 'rgba(255,149,0,0.07)',
      arrowColor: 'rgba(255,149,0,0.95)',
      description: 'Registry board, bookings, rental agreements, handover checklists, quotations and reminders.',
      tags: [{ label: 'Bookings', c: 'd' }, { label: 'Registry', c: 'd' }, { label: 'Agreements', c: 'd' }, { label: 'Reminders', c: 'd' }],
      onClick: () => navigate('/registry'),
    },
    {
      id: 'clients',
      title: 'Clients',
      subtitle: 'Individual, corporate & government',
      accent: 'linear-gradient(90deg, #1B4D5C, #2A7A8C)',
      borderColor: 'rgba(27,77,92,0.50)',
      glowColor: 'rgba(27,77,92,0.09)',
      arrowColor: 'rgba(100,181,246,0.95)',
      description: 'Manage individual, corporate, agency and government clients across both branches.',
      tags: [{ label: 'Individual', c: 'd' }, { label: 'Corporate', c: 'd' }, { label: 'Agency', c: 'd' }, { label: 'Government', c: 'd' }],
      onClick: () => navigate('/clients/individual'),
    },
    {
      id: 'fleet',
      title: 'PSK Fleet',
      subtitle: 'Vehicles, maintenance & compliance',
      accent: 'linear-gradient(90deg, #2D5F3F, #3A7A50)',
      borderColor: 'rgba(45,95,63,0.50)',
      glowColor: 'rgba(45,95,63,0.09)',
      arrowColor: 'rgba(129,199,132,0.95)',
      description: 'PSK vehicles, maintenance schedules, fuel consumption tracking and NTSA compliance.',
      tags: [{ label: 'Vehicles', c: 'd' }, { label: 'Maintenance', c: 'd' }, { label: 'Fuel log', c: 'd' }, { label: 'Compliance', c: 'd' }],
      onClick: () => navigate('/fleet/vehicles'),
    },
    {
      id: 'partners',
      title: 'Partners',
      subtitle: 'Drivers, staff & vehicle owners',
      accent: 'linear-gradient(90deg, #5C3D8C, #7B52B8)',
      borderColor: 'rgba(92,61,140,0.50)',
      glowColor: 'rgba(92,61,140,0.09)',
      arrowColor: 'rgba(206,147,216,0.95)',
      description: 'Drivers, staff management and private vehicle owners who partner with PSK.',
      tags: [{ label: 'Drivers & Staff', c: 'd' }, { label: 'Vehicle Owners', c: 'd' }, { label: 'Payouts', c: 'd' }],
      onClick: () => navigate('/partners/drivers'),
    },
    {
      id: 'finance',
      title: 'Finance',
      subtitle: 'PIN protected — authorised access only',
      accent: 'linear-gradient(90deg, #FFD700, #FF9500)',
      borderColor: 'rgba(255,215,0,0.40)',
      glowColor: 'rgba(255,215,0,0.06)',
      arrowColor: 'rgba(255,215,0,0.95)',
      description: 'P&L reports, invoices, M-Pesa reconciliation, expenses, owner payouts and exports.',
      tags: [{ label: '🔒 PIN protected', c: 'gold' }, { label: 'Documents', c: 'd' }, { label: 'Tap to unlock', c: 'gold' }],
      onClick: () => navigate('/finance'),
    },
    {
      id: 'intelligence',
      title: 'Intelligence',
      subtitle: 'Analytics, audit & system settings',
      accent: 'linear-gradient(90deg, #1B4D5C, #2D5F3F)',
      borderColor: 'rgba(27,77,92,0.45)',
      glowColor: 'rgba(27,77,92,0.08)',
      arrowColor: 'rgba(100,181,246,0.95)',
      description: 'Fleet analytics, performance trends, audit logs and system access control settings.',
      tags: [{ label: 'Analytics', c: 'd' }, { label: 'Audit log', c: 'd' }, { label: 'Settings', c: 'd' }],
      onClick: () => navigate('/analytics'),
    },
  ]

  const tagStyle = (c: string) => {
    if (c === 'gold') return { background: 'rgba(255,215,0,0.10)', border: '1px solid rgba(255,215,0,0.30)', color: 'rgba(255,215,0,0.88)' }
    return { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', color: '#CBD5E1' }
  }

  return (
    <div style={{ padding: '26px 28px 22px' }}>
      <style>{`
        @keyframes leopardFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-5px); }
        }
        .leopard-img { animation: leopardFloat 3.2s ease-in-out infinite; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.4)); }
        .cat-card { transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease; cursor: pointer; }
        .cat-card:hover { transform: translateY(-5px); }
      `}</style>

      {/* Welcome Banner */}
      <div style={{
        background: 'rgba(255,255,255,0.09)',
        border: '1.5px solid rgba(255,215,0,0.14)',
        borderRadius: '16px', padding: '20px 26px', marginBottom: '18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 4px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.95)', marginBottom: '4px', letterSpacing: '-0.4px' }}>
            {greeting}
          </div>
          <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.72)' }}>
            Here's what's happening across both branches today — {today}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>
          <img src="/branding/leopard.png" alt="Leopard" className="leopard-img"
            style={{ height: '88px', width: 'auto', objectFit: 'contain' }} />
          <div style={{ display: 'flex', gap: '9px' }}>
            {[
              { label: 'Available',   value: 0, color: 'rgba(129,199,132,0.95)', bg: 'rgba(129,199,132,0.09)', border: 'rgba(129,199,132,0.25)' },
              { label: 'Out on hire', value: 0, color: 'rgba(100,181,246,0.95)', bg: 'rgba(100,181,246,0.08)', border: 'rgba(100,181,246,0.25)' },
              { label: 'In service',  value: 0, color: 'rgba(255,183,77,0.92)',  bg: 'rgba(255,183,77,0.08)',  border: 'rgba(255,183,77,0.25)'  },
            ].map(s => (
              <div key={s.label} style={{
                background: s.bg, border: `1px solid ${s.border}`,
                borderRadius: '10px', padding: '9px 16px', textAlign: 'center', minWidth: '74px',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6 Category Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '13px', marginBottom: '16px' }}>
        {categories.map(cat => (
          <div key={cat.id} className="cat-card" onClick={cat.onClick} style={{
            background: 'rgba(10,22,34,0.70)',
            border: `1.5px solid ${cat.borderColor}`,
            borderRadius: '14px', overflow: 'hidden',
            boxShadow: `0 4px 24px rgba(0,0,0,0.28), 0 0 40px ${cat.glowColor}, inset 0 1px 0 rgba(255,255,255,0.04)`,
            backdropFilter: 'blur(14px)',
          }}>
            {/* Accent bar */}
            <div style={{ height: '3px', background: cat.accent }} />

            <div style={{ padding: '16px 18px 15px' }}>
              {/* Title + arrow */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.2px', lineHeight: 1.2 }}>
                    {cat.title}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '3px', fontWeight: 400 }}>
                    {cat.subtitle}
                  </div>
                </div>
                {/* Arrow button */}
                <div style={{
                  width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0, marginLeft: '10px',
                  background: `rgba(255,255,255,0.06)`,
                  border: `1.5px solid ${cat.borderColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 12px ${cat.glowColor}`,
                }}>
                  <span style={{ fontSize: '15px', color: cat.arrowColor, fontWeight: 800, lineHeight: 1 }}>→</span>
                </div>
              </div>

              <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.55', margin: '10px 0 12px' }}>
                {cat.description}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '11px', display: 'flex', flexWrap: 'nowrap', gap: '5px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {cat.tags.map((tag, i) => (
                  <span key={i} style={{ fontSize: '10px', fontWeight: 600, padding: '3px 9px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0, ...tagStyle(tag.c) }}>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {[
          { emoji: '📅', label: 'Pickups today',      value: String(stats.pickups),   color: 'rgba(129,199,132,0.95)', border: 'rgba(129,199,132,0.20)' },
          { emoji: '🔄', label: 'Returns today',      value: String(stats.returns),   color: 'rgba(100,181,246,0.95)', border: 'rgba(100,181,246,0.20)' },
          { emoji: '📄', label: 'Quotes pending',     value: String(stats.quotes),    color: 'rgba(255,215,0,0.92)',   border: 'rgba(255,215,0,0.20)'   },
          { emoji: '📱', label: 'Unmatched M-Pesa',   value: String(stats.mpesa),     color: 'rgba(239,154,154,0.95)', border: 'rgba(239,154,154,0.20)' },
          { emoji: '🔔', label: 'Reminders',           value: String(stats.reminders), color: 'rgba(255,183,77,0.92)',  border: 'rgba(255,183,77,0.20)'  },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, background: 'rgba(10,22,34,0.65)',
            border: `1.5px solid ${s.border}`, borderRadius: '12px',
            padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '11px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.20)', backdropFilter: 'blur(10px)',
          }}>
            <span style={{ fontSize: '19px', flexShrink: 0 }}>{s.emoji}</span>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: s.color, lineHeight: 1, letterSpacing: '-0.3px' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
