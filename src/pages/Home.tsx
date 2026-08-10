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
    return { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.40)' }
  }

  return (
    <div style={{ padding: '28px 30px 24px' }}>

      {/* Welcome Banner */}
      <div style={{
        background: 'rgba(255,255,255,0.035)',
        border: '1.5px solid rgba(255,215,0,0.12)',
        borderRadius: '14px', padding: '20px 28px', marginBottom: '22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        overflow: 'hidden', minHeight: '100px',
      }}>
        {/* Left — greeting */}
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.95)', marginBottom: '5px', letterSpacing: '-0.4px' }}>
            {greeting}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)' }}>
            Here's what's happening across both branches today — {today}
          </div>
        </div>

        {/* Right — leopard + stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>

          {/* Animated leopard image */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <style>{`
              @keyframes leopardFloat {
                0%,100% { transform: translateY(0px) rotate(0deg); }
                40%     { transform: translateY(-4px) rotate(0.5deg); }
                80%     { transform: translateY(-2px) rotate(-0.3deg); }
              }
              @keyframes tailWag {
                0%,100% { transform: rotate(0deg); }
                30%     { transform: rotate(8deg); }
                70%     { transform: rotate(-8deg); }
              }
              .leopard-img {
                animation: leopardFloat 3.2s ease-in-out infinite;
                filter: drop-shadow(0 8px 16px rgba(0,0,0,0.35));
              }
            `}</style>
            <img
              src="/branding/leopard.png"
              alt="Leopard yawning on branch"
              className="leopard-img"
              style={{
                height: '88px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>

          {/* 3 quick stats */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { label: 'Available', value: 0, color: 'rgba(129,199,132,0.95)', bg: 'rgba(129,199,132,0.09)', border: 'rgba(129,199,132,0.22)' },
              { label: 'On hire',   value: 0, color: 'rgba(100,181,246,0.95)', bg: 'rgba(100,181,246,0.08)', border: 'rgba(100,181,246,0.22)' },
              { label: 'Overdue',  value: 0, color: 'rgba(239,154,154,0.95)', bg: 'rgba(239,154,154,0.09)', border: 'rgba(239,154,154,0.22)' },
            ].map(s => (
              <div key={s.label} style={{
                background: s.bg, border: `1px solid ${s.border}`,
                borderRadius: '10px', padding: '10px 18px',
                textAlign: 'center', minWidth: '78px',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.32)', marginTop: '3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {categories.map(cat => (
          <div key={cat.id} onClick={cat.onClick} style={{
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
          }}>
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

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: '11px' }}>
        {[
          { emoji: '🚗', label: 'Available now',     value: '0',     color: 'rgba(129,199,132,0.95)' },
          { emoji: '📅', label: 'Out on hire',        value: '0',     color: 'rgba(100,181,246,0.95)' },
          { emoji: '⚠️', label: 'Overdue returns',   value: '0',     color: 'rgba(239,154,154,0.95)' },
          { emoji: '📱', label: 'Unmatched M-Pesa',  value: '0',     color: 'rgba(255,183,77,0.92)'  },
          { emoji: '💰', label: 'Revenue this month', value: 'KES 0', color: 'rgba(255,215,0,0.92)'   },
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
