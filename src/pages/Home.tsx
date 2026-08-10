import { useNavigate } from 'react-router-dom'

// Animated leopard sitting on a branch, yawning, tail swinging
function LeopardSVG() {
  return (
    <svg width="140" height="120" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes tailSwing {
          0%   { transform: rotate(0deg);   transform-origin: 68px 78px; }
          25%  { transform: rotate(18deg);  transform-origin: 68px 78px; }
          75%  { transform: rotate(-18deg); transform-origin: 68px 78px; }
          100% { transform: rotate(0deg);   transform-origin: 68px 78px; }
        }
        @keyframes yawn {
          0%,40%,100% { d: path("M54 62 Q60 65 66 62"); }
          55%,85%     { d: path("M52 62 Q60 72 68 62"); }
        }
        @keyframes jawDrop {
          0%,40%,100% { transform: translateY(0); }
          55%,85%     { transform: translateY(5px); }
        }
        @keyframes eyeBlink {
          0%,45%,55%,100% { transform: scaleY(1); }
          50%             { transform: scaleY(0.1); }
        }
        @keyframes breathe {
          0%,100% { transform: scaleY(1);    transform-origin: center bottom; }
          50%     { transform: scaleY(1.04); transform-origin: center bottom; }
        }
        @keyframes earTwitch {
          0%,70%,100% { transform: rotate(0deg);  transform-origin: 48px 18px; }
          75%          { transform: rotate(-8deg); transform-origin: 48px 18px; }
          80%          { transform: rotate(5deg);  transform-origin: 48px 18px; }
          85%          { transform: rotate(0deg);  transform-origin: 48px 18px; }
        }
        .tail-group { animation: tailSwing 2.8s ease-in-out infinite; }
        .body-group  { animation: breathe 3.2s ease-in-out infinite; }
        .jaw         { animation: jawDrop 4s ease-in-out infinite; }
        .eye-l, .eye-r { animation: eyeBlink 4s ease-in-out infinite; }
        .ear-group   { animation: earTwitch 4s ease-in-out infinite; }
      `}</style>

      {/* Branch */}
      <rect x="0" y="82" width="140" height="9" rx="4" fill="rgba(45,35,20,0.75)"/>
      <rect x="0" y="82" width="140" height="3" rx="2" fill="rgba(80,60,30,0.5)"/>

      {/* TAIL GROUP — swings from base */}
      <g className="tail-group">
        <path
          d="M68 78 Q50 90 38 105 Q30 115 20 112 Q14 110 16 104 Q20 100 26 103 Q32 106 38 98 Q50 84 65 75"
          stroke="#D4800A" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <path
          d="M68 78 Q50 90 38 105 Q30 115 20 112 Q14 110 16 104 Q20 100 26 103 Q32 106 38 98 Q50 84 65 75"
          stroke="#F5A623" strokeWidth="4" strokeLinecap="round" fill="none" strokeOpacity="0.6"/>
        {/* Tail tip black */}
        <ellipse cx="17" cy="106" rx="5" ry="4" fill="#1a1a1a"/>
      </g>

      {/* BODY GROUP — breathes */}
      <g className="body-group">
        {/* Main body */}
        <ellipse cx="68" cy="68" rx="28" ry="20" fill="#F5A623"/>
        {/* Belly lighter */}
        <ellipse cx="68" cy="72" rx="16" ry="13" fill="#FFD060" fillOpacity="0.55"/>

        {/* Front legs hanging down from branch */}
        <rect x="50" y="78" width="10" height="22" rx="5" fill="#E8941A"/>
        <rect x="76" y="78" width="10" height="22" rx="5" fill="#E8941A"/>
        {/* Paws */}
        <ellipse cx="55" cy="101" rx="7" ry="5" fill="#D4800A"/>
        <ellipse cx="81" cy="101" rx="7" ry="5" fill="#D4800A"/>

        {/* Body spots */}
        <ellipse cx="58" cy="62" rx="4" ry="3" fill="rgba(20,10,0,0.30)" transform="rotate(-15 58 62)"/>
        <ellipse cx="78" cy="60" rx="3.5" ry="2.5" fill="rgba(20,10,0,0.28)" transform="rotate(10 78 60)"/>
        <ellipse cx="70" cy="72" rx="3" ry="2.5" fill="rgba(20,10,0,0.25)"/>
        <ellipse cx="57" cy="74" rx="2.5" ry="2" fill="rgba(20,10,0,0.22)"/>
        <ellipse cx="80" cy="73" rx="2.5" ry="2" fill="rgba(20,10,0,0.22)"/>
        {/* Rosette spots */}
        <circle cx="63" cy="65" r="1.5" fill="rgba(20,10,0,0.20)"/>
        <circle cx="73" cy="64" r="1.5" fill="rgba(20,10,0,0.20)"/>
      </g>

      {/* NECK */}
      <ellipse cx="62" cy="50" rx="13" ry="11" fill="#F5A623"/>

      {/* EAR GROUP */}
      <g className="ear-group">
        <polygon points="42,22 48,10 55,22" fill="#E8941A"/>
        <polygon points="44,22 48,14 53,22" fill="#FFB830" fillOpacity="0.7"/>
        <polygon points="65,20 72,9 78,20" fill="#E8941A"/>
        <polygon points="67,20 72,13 77,20" fill="#FFB830" fillOpacity="0.7"/>
      </g>

      {/* HEAD */}
      <circle cx="62" cy="32" r="20" fill="#FFD060"/>
      {/* Head spots */}
      <ellipse cx="52" cy="26" rx="3" ry="2.5" fill="rgba(20,10,0,0.22)" transform="rotate(-20 52 26)"/>
      <ellipse cx="72" cy="25" rx="3" ry="2.5" fill="rgba(20,10,0,0.20)" transform="rotate(15 72 25)"/>
      <ellipse cx="60" cy="22" rx="2.5" ry="2" fill="rgba(20,10,0,0.18)"/>
      {/* Forehead stripe */}
      <path d="M60 16 Q62 12 64 16" stroke="rgba(20,10,0,0.20)" strokeWidth="1.5" fill="none"/>

      {/* EYES */}
      <g className="eye-l" style={{ transformOrigin: '53px 28px' }}>
        <ellipse cx="53" cy="28" rx="5" ry="5" fill="#2D5A0E"/>
        <ellipse cx="53" cy="28" rx="2.5" ry="4" fill="#0a0a0a"/>
        <circle cx="54.5" cy="26.5" r="1.2" fill="white" fillOpacity="0.8"/>
      </g>
      <g className="eye-r" style={{ transformOrigin: '71px 28px' }}>
        <ellipse cx="71" cy="28" rx="5" ry="5" fill="#2D5A0E"/>
        <ellipse cx="71" cy="28" rx="2.5" ry="4" fill="#0a0a0a"/>
        <circle cx="72.5" cy="26.5" r="1.2" fill="white" fillOpacity="0.8"/>
      </g>

      {/* NOSE */}
      <ellipse cx="62" cy="35" rx="4" ry="3" fill="#C05010"/>
      <path d="M60 37 Q62 39 64 37" stroke="#8B3A0A" strokeWidth="1" fill="none"/>

      {/* UPPER JAW / MUZZLE — fixed */}
      <ellipse cx="62" cy="37" rx="10" ry="6" fill="#FFE080"/>
      <ellipse cx="53" cy="37" rx="6" ry="5" fill="#FFE080"/>
      <ellipse cx="71" cy="37" rx="6" ry="5" fill="#FFE080"/>

      {/* LOWER JAW — drops for yawn */}
      <g className="jaw">
        <ellipse cx="62" cy="43" rx="9" ry="5" fill="#FFE080"/>
        {/* Open mouth / yawn */}
        <ellipse cx="62" cy="41" rx="7" ry="5" fill="#CC2200" fillOpacity="0.85"/>
        {/* Tongue */}
        <ellipse cx="62" cy="43" rx="5" ry="3.5" fill="#FF6644"/>
        {/* Teeth top */}
        <rect x="55" y="38" width="3" height="5" rx="1.5" fill="white"/>
        <rect x="66" y="38" width="3" height="5" rx="1.5" fill="white"/>
        {/* Teeth bottom */}
        <rect x="57" y="43" width="2.5" height="4" rx="1.2" fill="white"/>
        <rect x="64" y="43" width="2.5" height="4" rx="1.2" fill="white"/>
      </g>

      {/* WHISKERS */}
      <line x1="34" y1="35" x2="50" y2="36" stroke="rgba(255,255,255,0.75)" strokeWidth="1"/>
      <line x1="34" y1="38" x2="50" y2="38" stroke="rgba(255,255,255,0.75)" strokeWidth="1"/>
      <line x1="34" y1="41" x2="50" y2="40" stroke="rgba(255,255,255,0.65)" strokeWidth="1"/>
      <line x1="74" y1="36" x2="90" y2="35" stroke="rgba(255,255,255,0.75)" strokeWidth="1"/>
      <line x1="74" y1="38" x2="90" y2="38" stroke="rgba(255,255,255,0.75)" strokeWidth="1"/>
      <line x1="74" y1="40" x2="90" y2="41" stroke="rgba(255,255,255,0.65)" strokeWidth="1"/>
    </svg>
  )
}

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
        borderRadius: '14px', padding: '22px 28px', marginBottom: '22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        overflow: 'hidden',
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

        {/* Right — animated leopard + stats */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexShrink: 0 }}>
          <LeopardSVG />

          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
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
