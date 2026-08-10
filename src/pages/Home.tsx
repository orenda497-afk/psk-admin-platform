import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const categories = [
    {
      id: 'operations', title: 'Operations',
      accent: 'linear-gradient(90deg, #FF9500, #FFD700)',
      borderColor: 'rgba(255,149,0,0.35)',
      glowColor: 'rgba(255,149,0,0.08)',
      arrowColor: 'rgba(255,149,0,0.90)',
      description: 'Registry board, bookings, rental agreements, handover checklists and reminders across both branches.',
      tags: [{ label: 'Bookings', c: 'd' }, { label: 'Registry', c: 'd' }, { label: 'Agreements', c: 'd' }],
      finance: false,
      onClick: () => navigate('/registry'),
    },
    {
      id: 'clients', title: 'Clients & Drivers',
      accent: 'linear-gradient(90deg, #1B4D5C, #2D5F3F)',
      borderColor: 'rgba(27,77,92,0.55)',
      glowColor: 'rgba(27,77,92,0.10)',
      arrowColor: 'rgba(100,181,246,0.90)',
      description: 'Individual clients, corporate clients, drivers and staff management across both branches.',
      tags: [{ label: 'Individual clients', c: 'd' }, { label: 'Corporate clients', c: 'd' }, { label: 'Drivers', c: 'd' }],
      finance: false,
      onClick: () => navigate('/clients'),
    },
    {
      id: 'fleet', title: 'Fleet',
      accent: 'linear-gradient(90deg, #2D5F3F, #1B4D5C)',
      borderColor: 'rgba(45,95,63,0.55)',
      glowColor: 'rgba(45,95,63,0.10)',
      arrowColor: 'rgba(129,199,132,0.90)',
      description: 'Vehicle maintenance schedules, fuel consumption tracking and NTSA compliance calendar.',
      tags: [{ label: 'Maintenance', c: 'd' }, { label: 'Fuel log', c: 'd' }, { label: 'Compliance', c: 'd' }],
      finance: false,
      onClick: () => navigate('/maintenance'),
    },
    {
      id: 'owners', title: 'Vehicle Owners',
      accent: 'linear-gradient(90deg, #2D5F3F, #FFD700)',
      borderColor: 'rgba(45,95,63,0.50)',
      glowColor: 'rgba(45,95,63,0.08)',
      arrowColor: 'rgba(129,199,132,0.90)',
      description: 'Owner profiles, monthly 70/30 net profit payouts and the owner self-service portal.',
      tags: [{ label: 'Owner profiles', c: 'd' }, { label: 'Payouts', c: 'd' }, { label: 'Owner portal', c: 'd' }],
      finance: false,
      onClick: () => navigate('/owners'),
    },
    {
      id: 'finance', title: 'Finance',
      accent: 'linear-gradient(90deg, #FFD700, #FF9500)',
      borderColor: 'rgba(255,215,0,0.45)',
      glowColor: 'rgba(255,215,0,0.07)',
      arrowColor: 'rgba(255,215,0,0.95)',
      description: 'P&L reports, invoices, M-Pesa reconciliation, expenses, owner payouts and financial exports.',
      tags: [{ label: 'PIN protected', c: 'gold' }, { label: 'Documents', c: 'd' }, { label: 'Tap to unlock', c: 'gold' }],
      finance: true,
      onClick: () => navigate('/finance'),
    },
    {
      id: 'intelligence', title: 'Intelligence',
      accent: 'linear-gradient(90deg, #1B4D5C, #2D5F3F)',
      borderColor: 'rgba(27,77,92,0.50)',
      glowColor: 'rgba(27,77,92,0.09)',
      arrowColor: 'rgba(100,181,246,0.90)',
      description: 'Fleet analytics, performance trends, audit logs and system access control settings.',
      tags: [{ label: 'Analytics', c: 'd' }, { label: 'Audit log', c: 'd' }, { label: 'Settings', c: 'd' }],
      finance: false,
      onClick: () => navigate('/analytics'),
    },
  ]

  const tagStyle = (c: string) => {
    if (c === 'gold') return { background: 'rgba(255,215,0,0.09)', border: '1px solid rgba(255,215,0,0.28)', color: 'rgba(255,215,0,0.85)' }
    return { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.45)' }
  }

  return (
    <div style={{ padding: '28px 30px 24px' }}>
      <style>{`
        @keyframes leopardFloat {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-5px); }
        }
        .leopard-img { animation: leopardFloat 3.2s ease-in-out infinite; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.4)); }
        .cat-card { transition: all 0.22s ease; }
        .cat-card:hover { transform: translateY(-4px) !important; }
      `}</style>

      {/* Welcome Banner */}
      <div style={{
        background: 'rgba(255,255,255,0.035)',
        border: '1.5px solid rgba(255,215,0,0.14)',
        borderRadius: '16px', padding: '20px 28px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 4px 24px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.07)',
        overflow: 'hidden',
      }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.95)', marginBottom: '5px', letterSpacing: '-0.4px' }}>
            {greeting}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)' }}>
            Here's what's happening across both branches today — {today}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
          <img src="/branding/leopard.png" alt="Leopard" className="leopard-img"
            style={{ height: '90px', width: 'auto', objectFit: 'contain', display: 'block' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { label: 'Available', value: 0, color: 'rgba(129,199,132,0.95)', bg: 'rgba(129,199,132,0.09)', border: 'rgba(129,199,132,0.25)' },
              { label: 'On hire',   value: 0, color: 'rgba(100,181,246,0.95)', bg: 'rgba(100,181,246,0.08)', border: 'rgba(100,181,246,0.25)' },
              { label: 'Overdue',  value: 0, color: 'rgba(239,154,154,0.95)', bg: 'rgba(239,154,154,0.09)', border: 'rgba(239,154,154,0.25)' },
            ].map(s => (
              <div key={s.label} style={{
                background: s.bg, border: `1px solid ${s.border}`,
                borderRadius: '10px', padding: '10px 18px', textAlign: 'center', minWidth: '78px',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.32)', marginTop: '3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6 Category Cards — 3×2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '18px' }}>
        {categories.map(cat => (
          <div key={cat.id} className="cat-card" onClick={cat.onClick} style={{
            background: `rgba(12,24,36,0.65)`,
            border: `1.5px solid ${cat.borderColor}`,
            borderRadius: '15px', overflow: 'hidden', cursor: 'pointer',
            boxShadow: `0 4px 28px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 8px 32px ${cat.glowColor}`,
            backdropFilter: 'blur(12px)',
          }}>
            {/* Accent bar */}
            <div style={{ height: '3.5px', background: cat.accent }} />

            <div style={{ padding: '18px 20px 16px' }}>
              {/* Title row with arrow */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.2px' }}>
                  {cat.title}{cat.finance ? ' 🔒' : ''}
                </div>
                {/* Visible arrow */}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                  background: cat.finance ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.07)',
                  border: `1px solid ${cat.borderColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '14px', color: cat.arrowColor, fontWeight: 700, lineHeight: 1 }}>→</span>
                </div>
              </div>

              <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.40)', lineHeight: '1.58', marginBottom: '14px' }}>
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
      <div style={{ display: 'flex', gap: '10px' }}>
        {[
          { emoji: '🚗', label: 'Available now',     value: '0',     color: 'rgba(129,199,132,0.95)', border: 'rgba(129,199,132,0.18)' },
          { emoji: '📅', label: 'Out on hire',        value: '0',     color: 'rgba(100,181,246,0.95)', border: 'rgba(100,181,246,0.18)' },
          { emoji: '⚠️', label: 'Overdue returns',   value: '0',     color: 'rgba(239,154,154,0.95)', border: 'rgba(239,154,154,0.18)' },
          { emoji: '📱', label: 'Unmatched M-Pesa',  value: '0',     color: 'rgba(255,183,77,0.92)',  border: 'rgba(255,183,77,0.18)'  },
          { emoji: '💰', label: 'Revenue this month', value: 'KES 0', color: 'rgba(255,215,0,0.92)',  border: 'rgba(255,215,0,0.18)'   },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1,
            background: 'rgba(12,24,36,0.60)',
            border: `1.5px solid ${s.border}`,
            borderRadius: '12px',
            padding: '13px 15px',
            display: 'flex', alignItems: 'center', gap: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            backdropFilter: 'blur(10px)',
          }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>{s.emoji}</span>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: s.color, lineHeight: 1, letterSpacing: '-0.4px' }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.30)', marginTop: '3px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
