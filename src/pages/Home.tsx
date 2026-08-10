import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const stats = {
    available: 12,
    outOnHire: 6,
    overdue: 2,
    unmatched: 5,
    revenue: 425000,
  }

  const categories = [
    {
      id: 'operations',
      title: 'Operations',
      description: 'Manage bookings, fleet, and daily operations',
      accentBar: 'linear-gradient(90deg, #FF9500, #FFD700)',
      tags: [
        { label: '2 overdue', color: 'red' },
        { label: '8 bookings', color: 'amber' },
        { label: '9 reminders', color: 'amber' },
      ],
      onClick: () => navigate('/operations/registry'),
    },
    {
      id: 'clients',
      title: 'Clients & Drivers',
      description: 'Manage customer profiles and driver assignments',
      accentBar: 'linear-gradient(90deg, #1B4D5C, #2D5F3F)',
      tags: [
        { label: '24 clients', color: 'default' },
        { label: '8 drivers', color: 'default' },
      ],
      onClick: () => navigate('/clients'),
    },
    {
      id: 'fleet',
      title: 'Fleet',
      description: 'Monitor vehicle maintenance and fuel consumption',
      accentBar: 'linear-gradient(90deg, #2D5F3F, #1B4D5C)',
      tags: [
        { label: '20 vehicles', color: 'green' },
        { label: '2 in service', color: 'amber' },
      ],
      onClick: () => navigate('/fleet/maintenance'),
    },
    {
      id: 'owners',
      title: 'Vehicle Owners',
      description: 'Manage owner profiles and payment schedules',
      accentBar: 'linear-gradient(90deg, #2D5F3F, #FFD700)',
      tags: [
        { label: '6 owners', color: 'default' },
        { label: '2 payouts pending', color: 'amber' },
      ],
      onClick: () => navigate('/owners'),
    },
    {
      id: 'finance',
      title: 'Finance 🔒',
      description: 'Access financial documents and reports',
      accentBar: 'linear-gradient(90deg, #FFD700, #FF9500)',
      tags: [
        { label: 'PIN protected', color: 'gold' },
        { label: '3 overdue invoices', color: 'red' },
      ],
      onClick: () => navigate('/finance'),
    },
    {
      id: 'intelligence',
      title: 'Intelligence',
      description: 'View analytics and audit logs',
      accentBar: 'linear-gradient(90deg, #1B4D5C, #2D5F3F)',
      tags: [
        { label: 'Analytics', color: 'default' },
        { label: 'Audit log', color: 'default' },
      ],
      onClick: () => navigate('/intelligence/analytics'),
    },
  ]

  const getTagStyle = (color: string) => {
    const styles: Record<string, { bg: string; border: string; text: string }> = {
      red: {
        bg: 'rgba(231,76,60,0.11)',
        border: 'rgba(231,76,60,0.20)',
        text: 'rgba(239,154,154,0.88)',
      },
      amber: {
        bg: 'rgba(255,149,0,0.11)',
        border: 'rgba(255,149,0,0.20)',
        text: 'rgba(255,183,77,0.90)',
      },
      green: {
        bg: 'rgba(45,95,63,0.22)',
        border: 'rgba(76,175,114,0.22)',
        text: 'rgba(129,199,132,0.85)',
      },
      gold: {
        bg: 'rgba(255,215,0,0.09)',
        border: 'rgba(255,215,0,0.22)',
        text: 'rgba(255,215,0,0.78)',
      },
      default: {
        bg: 'rgba(255,255,255,0.06)',
        border: 'rgba(255,255,255,0.09)',
        text: 'rgba(255,255,255,0.40)',
      },
    }
    return styles[color] || styles.default
  }

  return (
    <div style={{ padding: '28px 30px 24px' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'rgba(255,255,255,0.035)',
          border: '1.5px solid rgba(255,215,0,0.12)',
          borderRadius: '14px',
          padding: '20px 26px',
          marginBottom: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.95)', marginBottom: '4px' }}>
            {greeting} 👋
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>
            Here's what's happening across both branches today.
          </div>
        </div>

        {/* Right side stats */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              background: 'rgba(129,199,132,0.09)',
              border: '1px solid rgba(129,199,132,0.22)',
              borderRadius: '10px',
              padding: '12px 16px',
              textAlign: 'center',
              minWidth: '90px',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'rgba(129,199,132,0.95)' }}>
              {stats.available}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.40)', marginTop: '3px' }}>Available</div>
          </div>
          <div
            style={{
              background: 'rgba(100,181,246,0.08)',
              border: '1px solid rgba(100,181,246,0.22)',
              borderRadius: '10px',
              padding: '12px 16px',
              textAlign: 'center',
              minWidth: '90px',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'rgba(100,181,246,0.95)' }}>
              {stats.outOnHire}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.40)', marginTop: '3px' }}>On hire</div>
          </div>
          <div
            style={{
              background: 'rgba(239,154,154,0.09)',
              border: '1px solid rgba(239,154,154,0.22)',
              borderRadius: '10px',
              padding: '12px 16px',
              textAlign: 'center',
              minWidth: '90px',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'rgba(239,154,154,0.95)' }}>
              {stats.overdue}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.40)', marginTop: '3px' }}>Overdue</div>
          </div>
        </div>
      </div>

      {/* Category Cards Grid - 3×2 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
          marginBottom: '22px',
        }}
      >
        {categories.map(category => (
          <div
            key={category.id}
            onClick={category.onClick}
            style={{
              background: 'rgba(255,255,255,0.042)',
              backdropFilter: 'blur(18px)',
              border: '1.5px solid rgba(255,255,255,0.09)',
              borderRadius: '14px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.24s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(-2px)'
              el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.32)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = '0 4px 22px rgba(0,0,0,0.18)'
            }}
          >
            {/* Accent bar - 3px gradient top */}
            <div
              style={{
                height: '3px',
                background: category.accentBar,
              }}
            />

            {/* Card content */}
            <div style={{ padding: '18px 16px' }}>
              <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'rgba(255,255,255,0.92)', marginBottom: '6px' }}>
                {category.title}
              </div>
              <div
                style={{
                  fontSize: '11.5px',
                  color: 'rgba(255,255,255,0.55)',
                  lineHeight: '1.58',
                  marginBottom: '12px',
                }}
              >
                {category.description}
              </div>

              {/* Tags separator */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '10px' }} />

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {category.tags.map((tag, idx) => {
                  const tagStyle = getTagStyle(tag.color)
                  return (
                    <span
                      key={idx}
                      style={{
                        fontSize: '10px',
                        fontWeight: 500,
                        background: tagStyle.bg,
                        border: `1px solid ${tagStyle.border}`,
                        color: tagStyle.text,
                        borderRadius: '6px',
                        padding: '4px 8px',
                      }}
                    >
                      {tag.label}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Strip - 5 glass panels */}
      <div
        style={{
          display: 'flex',
          gap: '11px',
        }}
      >
        {[
          { emoji: '🚗', label: 'Available vehicles', value: stats.available, color: 'rgba(129,199,132,0.95)' },
          { emoji: '📅', label: 'Out on hire', value: stats.outOnHire, color: 'rgba(100,181,246,0.95)' },
          { emoji: '⚠️', label: 'Overdue returns', value: stats.overdue, color: 'rgba(239,154,154,0.95)' },
          { emoji: '📱', label: 'Unmatched M-Pesa', value: stats.unmatched, color: 'rgba(255,183,77,0.90)' },
          {
            emoji: '💰',
            label: 'Revenue this month',
            value: `KES ${(stats.revenue / 1000).toFixed(0)}k`,
            color: 'rgba(255,215,0,0.90)',
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.042)',
              backdropFilter: 'blur(18px)',
              border: '1.5px solid rgba(255,255,255,0.09)',
              borderRadius: '14px',
              padding: '14px 16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>{stat.emoji}</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: stat.color, marginBottom: '2px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.40)' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
