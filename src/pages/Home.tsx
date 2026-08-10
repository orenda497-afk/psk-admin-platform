import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const categories = [
    {
      id: 'operations', title: 'Operations', finance: false,
      accent: 'linear-gradient(90deg, #FF9500, #FFD700)',
      description: 'Registry board, bookings, rental agreements, handover checklists and reminders across both branches.',
      tags: [{ label: 'Bookings', c: 'd' }, { label: 'Registry', c: 'd' }, { label: 'Agreements', c: 'd' }],
      onClick: () => navigate('/registry'),
    },
    {
      id: 'clients', title: 'Clients & Drivers', finance: false,
      accent: 'linear-gradient(90deg, #1B4D5C, #2D5F3F)',
      description: 'Individual clients, corporate clients, drivers and staff management across both branches.',
      tags: [{ label: 'Individual clients', c: 'd' }, { label: 'Corporate clients', c: 'd' }, { label: 'Drivers', c: 'd' }],
      onClick: () => navigate('/clients'),
    },
    {
      id: 'fleet', title: 'Fleet', finance: false,
      accent: 'linear-gradient(90deg, #2D5F3F, #1B4D5C)',
      description: 'Vehicle maintenance schedules, fuel consumption tracking and NTSA compliance calendar.',
      tags: [{ label: 'Maintenance', c: 'd' }, { label: 'Fuel log', c: 'd' }, { label: 'Compliance', c: 'd' }],
      onClick: () => navigate('/maintenance'),
    },
    {
      id: 'owners', title: 'Vehicle Owners', finance: false,
      accent: 'linear-gradient(90deg, #2D5F3F, #FFD700)',
      description: 'Owner profiles, monthly 70/30 net profit payouts and the owner self-service portal.',
      tags: [{ label: 'Owner profiles', c: 'd' }, { label: 'Payouts', c: 'd' }, { label: 'Owner portal', c: 'd' }],
      onClick: () => navigate('/owners'),
    },
    {
      id: 'finance', title: 'Finance 🔒', finance: true,
      accent: 'linear-gradient(90deg, #FFD700, #FF9500)',
      description: 'P&L reports, invoices, M-Pesa reconciliation, expenses, owner payouts and financial exports.',
      tags: [{ label: 'PIN protected', c: 'gold' }, { label: 'Documents', c: 'd' }, { label: 'Tap to unlock', c: 'gold' }],
      onClick: () => navigate('/finance'),
    },
    {
      id: 'intelligence', title: 'Intelligence', finance: false,
      accent: 'linear-gradient(90deg, #1B4D5C, #2D5F3F)',
      description: 'Fleet analytics, performance trends, audit logs and system access control settings.',
      tags: [{ label: 'Analytics', c: 'd' }, { label: 'Audit log', c: 'd' }, { label: 'Settings', c: 'd' }],
      onClick: () => navigate('/analytics'),
    },
  ]

  const tagStyle = (c: string) => {
    if (c === 'gold') return { background: 'rgba(255,215,0,0.09)', border: '1px solid rgba(255,215,0,0.22)', color: 'rgba(255,215,0,0.78)' }
    if (c === 'red')  return { background: 'rgba(231,76,60,0.11)',  border: '1px solid rgba(231,76,60,0.20)',  color: 'rgba(239,154,154,0.88)' }
    if (c === 'amber')return { background: 'rgba(255,149,0,0.11)',  border: '1px solid rgba(255,149,0,0.20)',  color: 'rgba(255,183,77,0.90)' }
    return { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.40)' }
  }

  return (
    <div style={{ padding: '28px 30px 24px' }}>

      {/* Welcome Banner */}
      <div style={{
        background: 'rgba(255,255,255,0.035)',
        border: '1.5px solid rgba(255,215,0,0.12)',
        borderRadius: '14px', padding: '22px 28px', marginBottom: '22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.95)', marginBottom: '5px', letterSpacing: '-0.4px' }}>
            {greeting} 👋
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)' }}>
            Here's what's happening across both branches today — {today}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Sitting Leopard SVG */}
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.9, flexShrink: 0 }}>
            {/* Tail curving up behind */}
            <path d="M58 55 Q72 48 70 36 Q68 26 60 28" stroke="#FF9500" strokeWidth="5" strokeLinecap="round" fill="none"/>
            <path d="M60 28 Q56 24 58 20" stroke="#FF9500" strokeWidth="4" strokeLinecap="round" fill="none"/>
            {/* Body - sitting upright */}
            <ellipse cx="42" cy="52" rx="16" ry="14" fill="#FF9500"/>
            {/* Chest/belly lighter */}
            <ellipse cx="42" cy="54" rx="9" ry="10" fill="#FFD700" fillOpacity="0.5"/>
            {/* Back legs sitting */}
            <ellipse cx="30" cy="64" rx="7" ry="5" fill="#FF9500"/>
            <ellipse cx="54" cy="64" rx="7" ry="5" fill="#FF9500"/>
            {/* Front paws */}
            <ellipse cx="34" cy="70" rx="5" ry="4" fill="#FF9500"/>
            <ellipse cx="50" cy="70" rx="5" ry="4" fill="#FF9500"/>
            {/* Neck */}
            <ellipse cx="42" cy="38" rx="10" ry="8" fill="#FFD700" fillOpacity="0.95"/>
            {/* Head */}
            <circle cx="42" cy="26" r="13" fill="#FFD700" fillOpacity="0.98"/>
            {/* Ears */}
            <polygon points="31,17 35,9 39,17" fill="#FF9500"/>
            <polygon points="45,17 49,9 53,17" fill="#FF9500"/>
            <polygon points="32,17 35,12 38,17" fill="#FFD700" fillOpacity="0.7"/>
            <polygon points="46,17 49,12 52,17" fill="#FFD700" fillOpacity="0.7"/>
            {/* Eyes */}
            <circle cx="37" cy="24" r="3" fill="rgba(8,20,30,0.9)"/>
            <circle cx="47" cy="24" r="3" fill="rgba(8,20,30,0.9)"/>
            <circle cx="38" cy="23" r="1" fill="white"/>
            <circle cx="48" cy="23" r="1" fill="white"/>
            {/* Nose */}
            <ellipse cx="42" cy="29" rx="3" ry="2" fill="#CC7700"/>
            {/* Mouth */}
            <path d="M39 31 Q42 33 45 31" stroke="#CC7700" strokeWidth="1" fill="none" strokeLinecap="round"/>
            {/* Whiskers */}
            <line x1="26" y1="28" x2="36" y2="29" stroke="rgba(255,215,0,0.6)" strokeWidth="0.8"/>
            <line x1="26" y1="30" x2="36" y2="30" stroke="rgba(255,215,0,0.6)" strokeWidth="0.8"/>
            <line x1="48" y1="29" x2="58" y2="28" stroke="rgba(255,215,0,0.6)" strokeWidth="0.8"/>
            <line x1="48" y1="30" x2="58" y2="30" stroke="rgba(255,215,0,0.6)" strokeWidth="0.8"/>
            {/* Spots on body */}
            <ellipse cx="38" cy="48" rx="3" ry="2" fill="rgba(8,20,30,0.22)"/>
            <ellipse cx="48" cy="45" rx="2.5" ry="2" fill="rgba(8,20,30,0.22)"/>
            <ellipse cx="44" cy="55" rx="2.5" ry="2" fill="rgba(8,20,30,0.22)"/>
            <ellipse cx="35" cy="57" rx="2" ry="1.5" fill="rgba(8,20,30,0.22)"/>
          </svg>

          {/* 3 stat boxes */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { label: 'Available', value: 0, color: 'rgba(129,199,132,0.95)', bg: 'rgba(129,199,132,0.09)', border: 'rgba(129,199,132,0.22)' },
              { label: 'On hire',   value: 0, color: 'rgba(100,181,246,0.95)', bg: 'rgba(100,181,246,0.08)', border: 'rgba(100,181,246,0.22)' },
              { label: 'Overdue',  value: 0, color: 'rgba(239,154,154,0.95)', bg: 'rgba(239,154,154,0.09)', border: 'rgba(239,154,154,0.22)' },
            ].map(s => (
              <div key={s.label} style={{
                background: s.bg, border: `1px solid ${s.border}`,
                borderRadius: '10px', padding: '10px 18px',
                textAlign: 'center', minWidth: '80px',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.32)', marginTop: '3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Cards — 3×2, NO icons, NO arrows, NO dummy data */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {categories.map(cat => (
          <div
            key={cat.id}
            onClick={cat.onClick}
            style={{
              background: cat.finance ? 'rgba(255,215,0,0.028)' : 'rgba(255,255,255,0.042)',
              border: `1.5px solid ${cat.finance ? 'rgba(255,215,0,0.22)' : 'rgba(255,255,255,0.09)'}`,
              borderRadius: '14px', overflow: 'hidden', cursor: 'pointer',
              transition: 'all 0.20s ease',
              boxShadow: '0 2px 18px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(-2px)'
              el.style.boxShadow = '0 10px 32px rgba(0,0,0,0.24)'
              el.style.borderColor = cat.finance ? 'rgba(255,215,0,0.40)' : 'rgba(255,255,255,0.18)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = '0 2px 18px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)'
              el.style.borderColor = cat.finance ? 'rgba(255,215,0,0.22)' : 'rgba(255,255,255,0.09)'
            }}
          >
            <div style={{ height: '3px', background: cat.accent }} />
            <div style={{ padding: '18px 20px 16px' }}>
              <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'rgba(255,255,255,0.92)', marginBottom: '7px', letterSpacing: '-0.2px' }}>
                {cat.title}
              </div>
              <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.38)', lineHeight: '1.58', marginBottom: '14px' }}>
                {cat.description}
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {cat.tags.map((tag, i) => (
                  <span key={i} style={{ fontSize: '9px', fontWeight: 600, padding: '3px 9px', borderRadius: '20px', ...tagStyle(tag.c) }}>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats strip — all zeros, no dummy data */}
      <div style={{ display: 'flex', gap: '11px' }}>
        {[
          { emoji: '🚗', label: 'Available now',      value: '0',      color: 'rgba(129,199,132,0.95)' },
          { emoji: '📅', label: 'Out on hire',         value: '0',      color: 'rgba(100,181,246,0.95)' },
          { emoji: '⚠️', label: 'Overdue returns',    value: '0',      color: 'rgba(239,154,154,0.95)' },
          { emoji: '📱', label: 'Unmatched M-Pesa',   value: '0',      color: 'rgba(255,183,77,0.92)'  },
          { emoji: '💰', label: 'Revenue this month',  value: 'KES 0',  color: 'rgba(255,215,0,0.92)'   },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, background: 'rgba(255,255,255,0.040)',
            border: '1.5px solid rgba(255,215,0,0.10)', borderRadius: '12px',
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '13px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>{s.emoji}</span>
            <div>
              <div style={{ fontSize: '19px', fontWeight: 800, color: s.color, lineHeight: 1, letterSpacing: '-0.4px' }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.32)', marginTop: '3px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
