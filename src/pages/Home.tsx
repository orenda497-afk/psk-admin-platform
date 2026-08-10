import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const categories = [
    {
      id: 'operations',
      title: 'Operations',
      description: 'Registry board, bookings, rental agreements, handover checklists and reminders across both branches.',
      accent: 'linear-gradient(90deg, #FF9500, #FFD700)',
      tags: [
        { label: 'Bookings', color: 'default' },
        { label: 'Registry', color: 'default' },
        { label: 'Agreements', color: 'default' },
      ],
      finance: false,
      onClick: () => navigate('/registry'),
    },
    {
      id: 'clients',
      title: 'Clients & Drivers',
      description: 'Manage individual and corporate client profiles, drivers and staff across both branches.',
      accent: 'linear-gradient(90deg, #1B4D5C, #2D5F3F)',
      tags: [
        { label: 'Individual clients', color: 'default' },
        { label: 'Corporate clients', color: 'default' },
        { label: 'Drivers', color: 'default' },
      ],
      finance: false,
      onClick: () => navigate('/clients'),
    },
    {
      id: 'fleet',
      title: 'Fleet',
      description: 'Vehicle maintenance schedules, fuel consumption tracking and NTSA compliance calendar.',
      accent: 'linear-gradient(90deg, #2D5F3F, #1B4D5C)',
      tags: [
        { label: 'Maintenance', color: 'default' },
        { label: 'Fuel log', color: 'default' },
        { label: 'Compliance', color: 'default' },
      ],
      finance: false,
      onClick: () => navigate('/maintenance'),
    },
    {
      id: 'owners',
      title: 'Vehicle Owners',
      description: 'Owner profiles, monthly 70/30 net profit payouts and the owner self-service portal.',
      accent: 'linear-gradient(90deg, #2D5F3F, #FFD700)',
      tags: [
        { label: 'Owner profiles', color: 'default' },
        { label: 'Payouts', color: 'default' },
        { label: 'Owner portal', color: 'default' },
      ],
      finance: false,
      onClick: () => navigate('/owners'),
    },
    {
      id: 'finance',
      title: 'Finance 🔒',
      description: 'P&L reports, invoices, M-Pesa reconciliation, expenses, owner payouts and financial exports.',
      accent: 'linear-gradient(90deg, #FFD700, #FF9500)',
      tags: [
        { label: 'PIN protected', color: 'gold' },
        { label: 'Documents', color: 'default' },
        { label: 'Tap to unlock', color: 'gold' },
      ],
      finance: true,
      onClick: () => navigate('/finance'),
    },
    {
      id: 'intelligence',
      title: 'Intelligence',
      description: 'Fleet analytics, performance trends, audit logs and system access control settings.',
      accent: 'linear-gradient(90deg, #1B4D5C, #2D5F3F)',
      tags: [
        { label: 'Analytics', color: 'default' },
        { label: 'Audit log', color: 'default' },
        { label: 'Settings', color: 'default' },
      ],
      finance: false,
      onClick: () => navigate('/analytics'),
    },
  ]

  const tagStyle = (color: string) => {
    if (color === 'gold') return {
      background: 'rgba(255,215,0,0.09)', border: '1px solid rgba(255,215,0,0.22)',
      color: 'rgba(255,215,0,0.78)',
    }
    if (color === 'red') return {
      background: 'rgba(231,76,60,0.11)', border: '1px solid rgba(231,76,60,0.20)',
      color: 'rgba(239,154,154,0.88)',
    }
    if (color === 'amber') return {
      background: 'rgba(255,149,0,0.11)', border: '1px solid rgba(255,149,0,0.20)',
      color: 'rgba(255,183,77,0.90)',
    }
    return {
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)',
      color: 'rgba(255,255,255,0.40)',
    }
  }

  return (
    <div style={{ padding: '28px 30px 24px' }}>

      {/* Welcome Banner */}
      <div style={{
        background: 'rgba(255,255,255,0.035)',
        border: '1.5px solid rgba(255,215,0,0.12)',
        borderRadius: '14px',
        padding: '22px 28px',
        marginBottom: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      }}>
        {/* Left */}
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.95)', marginBottom: '5px', letterSpacing: '-0.4px' }}>
            {greeting} 👋
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)' }}>
            Here's what's happening across both branches today — {today}
          </div>
        </div>

        {/* Right — leopard + quick stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Leopard SVG */}
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
            {/* Body */}
            <ellipse cx="38" cy="44" rx="18" ry="13" fill="#FF9500" fillOpacity="0.9"/>
            {/* Head */}
            <circle cx="22" cy="36" r="11" fill="#FFD700" fillOpacity="0.95"/>
            {/* Ears */}
            <polygon points="14,27 18,20 22,27" fill="#FF9500"/>
            <polygon points="22,27 26,20 30,27" fill="#FF9500"/>
            {/* Inner ears */}
            <polygon points="15,27 18,22 21,27" fill="#FFD700" fillOpacity="0.6"/>
            <polygon points="23,27 26,22 29,27" fill="#FFD700" fillOpacity="0.6"/>
            {/* Eyes */}
            <circle cx="18" cy="35" r="2" fill="rgba(8,20,30,0.9)"/>
            <circle cx="26" cy="35" r="2" fill="rgba(8,20,30,0.9)"/>
            <circle cx="18.7" cy="34.3" r="0.7" fill="white"/>
            <circle cx="26.7" cy="34.3" r="0.7" fill="white"/>
            {/* Nose */}
            <ellipse cx="22" cy="39" rx="2.5" ry="1.5" fill="#CC7A00"/>
            {/* Whiskers */}
            <line x1="10" y1="37" x2="18" y2="38" stroke="#FFD700" strokeWidth="0.8" strokeOpacity="0.7"/>
            <line x1="10" y1="39" x2="18" y2="39" stroke="#FFD700" strokeWidth="0.8" strokeOpacity="0.7"/>
            <line x1="26" y1="38" x2="34" y2="37" stroke="#FFD700" strokeWidth="0.8" strokeOpacity="0.7"/>
            <line x1="26" y1="39" x2="34" y2="39" stroke="#FFD700" strokeWidth="0.8" strokeOpacity="0.7"/>
            {/* Legs */}
            <rect x="26" y="54" width="6" height="12" rx="3" fill="#FF9500"/>
            <rect x="34" y="54" width="6" height="12" rx="3" fill="#FF9500"/>
            <rect x="42" y="54" width="6" height="12" rx="3" fill="#FF9500"/>
            <rect x="50" y="54" width="6" height="10" rx="3" fill="#FF9500"/>
            {/* Tail */}
            <path d="M56 44 Q66 40 62 32 Q60 28 56 30" stroke="#FF9500" strokeWidth="4" strokeLinecap="round" fill="none"/>
            {/* Spots */}
            <ellipse cx="36" cy="40" rx="3" ry="2" fill="rgba(8,20,30,0.25)"/>
            <ellipse cx="44" cy="36" rx="2.5" ry="2" fill="rgba(8,20,30,0.25)"/>
            <ellipse cx="50" cy="44" rx="2.5" ry="1.8" fill="rgba(8,20,30,0.25)"/>
            <ellipse cx="40" cy="50" rx="2" ry="1.5" fill="rgba(8,20,30,0.25)"/>
          </svg>

          {/* 3 quick stats */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { label: 'Available', value: 0, color: 'rgba(129,199,132,0.95)', bg: 'rgba(129,199,132,0.09)', border: 'rgba(129,199,132,0.22)' },
              { label: 'On hire', value: 0, color: 'rgba(100,181,246,0.95)', bg: 'rgba(100,181,246,0.08)', border: 'rgba(100,181,246,0.22)' },
              { label: 'Overdue', value: 0, color: 'rgba(239,154,154,0.95)', bg: 'rgba(239,154,154,0.09)', border: 'rgba(239,154,154,0.22)' },
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

      {/* Category Cards — 3×2 grid, NO icons, NO arrows */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '14px',
        marginBottom: '20px',
      }}>
        {categories.map(cat => (
          <div
            key={cat.id}
            onClick={cat.onClick}
            style={{
              background: cat.finance ? 'rgba(255,215,0,0.028)' : 'rgba(255,255,255,0.042)',
              border: `1.5px solid ${cat.finance ? 'rgba(255,215,0,0.22)' : 'rgba(255,255,255,0.09)'}`,
              borderRadius: '14px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.20s ease',
              boxShadow: '0 2px 18px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(-2px)'
              el.style.boxShadow = '0 10px 32px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.08)'
              el.style.borderColor = cat.finance ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.15)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = '0 2px 18px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)'
              el.style.borderColor = cat.finance ? 'rgba(255,215,0,0.22)' : 'rgba(255,255,255,0.09)'
            }}
          >
            {/* Accent bar — 3px, no border-radius on top */}
            <div style={{ height: '3px', background: cat.accent }} />

            {/* Card body */}
            <div style={{ padding: '18px 20px 16px' }}>
              <div style={{
                fontSize: '14.5px', fontWeight: 700,
                color: 'rgba(255,255,255,0.92)',
                marginBottom: '7px', letterSpacing: '-0.2px',
              }}>
                {cat.title}
              </div>
              <div style={{
                fontSize: '11.5px', color: 'rgba(255,255,255,0.38)',
                lineHeight: '1.58', marginBottom: '14px',
              }}>
                {cat.description}
              </div>

              {/* Tags */}
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.07)',
                paddingTop: '12px',
                display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center',
              }}>
                {cat.tags.map((tag, i) => (
                  <span key={i} style={{
                    fontSize: '9px', fontWeight: 600,
                    padding: '3px 9px', borderRadius: '20px',
                    ...tagStyle(tag.color),
                  }}>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats strip — 5 glass panels */}
      <div style={{ display: 'flex', gap: '11px' }}>
        {[
          { emoji: '🚗', label: 'Available now',     value: '0',       color: 'rgba(129,199,132,0.95)' },
          { emoji: '📅', label: 'Out on hire',        value: '0',       color: 'rgba(100,181,246,0.95)' },
          { emoji: '⚠️', label: 'Overdue returns',   value: '0',       color: 'rgba(239,154,154,0.95)' },
          { emoji: '📱', label: 'Unmatched M-Pesa',  value: '0',       color: 'rgba(255,183,77,0.92)'  },
          { emoji: '💰', label: 'Revenue this month', value: 'KES 0',  color: 'rgba(255,215,0,0.92)'   },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1,
            background: 'rgba(255,255,255,0.040)',
            border: '1.5px solid rgba(255,215,0,0.10)',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: '13px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>{s.emoji}</span>
            <div>
              <div style={{ fontSize: '19px', fontWeight: 800, color: s.color, lineHeight: 1, letterSpacing: '-0.4px' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.32)', marginTop: '3px' }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
