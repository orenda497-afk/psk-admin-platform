import { useState } from 'react'

interface LoginPageProps {
  onLogin: (email: string) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      onLogin(email)
      setLoading(false)
    }, 500)
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      /* Vivid African savanna sunset — pure CSS, no distortion */
      background: `
        linear-gradient(
          180deg,
          #0a0a1a 0%,
          #1a0a2e 8%,
          #2d0a3e 15%,
          #8B1A00 28%,
          #CC3300 38%,
          #FF6600 48%,
          #FF9900 56%,
          #FFB800 62%,
          #FFD700 68%,
          #FF9500 74%,
          #CC4400 80%,
          #661100 88%,
          #1a0505 100%
        )
      `,
    }}>

      {/* Stars in the sky */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() > 0.8 ? '2px' : '1px',
            height: Math.random() > 0.8 ? '2px' : '1px',
            background: 'white',
            borderRadius: '50%',
            top: `${Math.random() * 35}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.8 + 0.2,
          }} />
        ))}
      </div>

      {/* Sun glow */}
      <div style={{
        position: 'absolute',
        width: '280px', height: '280px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,220,0,0.55) 0%, rgba(255,140,0,0.30) 40%, transparent 70%)',
        top: '38%', left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      {/* Sun disc */}
      <div style={{
        position: 'absolute',
        width: '80px', height: '80px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #FFFFFF 0%, #FFE566 30%, #FFB800 60%, #FF8C00 100%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 60px rgba(255,200,0,0.8), 0 0 120px rgba(255,140,0,0.4)',
        pointerEvents: 'none',
      }} />

      {/* Horizon glow */}
      <div style={{
        position: 'absolute',
        bottom: '32%', left: 0, right: 0,
        height: '120px',
        background: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(255,100,0,0.35), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Savanna ground */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '32%',
        background: 'linear-gradient(180deg, #3d1a00 0%, #1a0800 100%)',
        pointerEvents: 'none',
      }} />

      {/* Acacia tree left */}
      <svg style={{ position: 'absolute', bottom: '30%', left: '6%', opacity: 0.95 }}
        width="140" height="180" viewBox="0 0 140 180">
        {/* Trunk */}
        <rect x="65" y="80" width="10" height="100" fill="#1a0800"/>
        <rect x="68" y="60" width="7" height="40" fill="#1a0800"/>
        {/* Branches */}
        <line x1="72" y1="80" x2="30" y2="55" stroke="#1a0800" strokeWidth="5"/>
        <line x1="72" y1="75" x2="110" y2="50" stroke="#1a0800" strokeWidth="5"/>
        <line x1="72" y1="70" x2="95" y2="40" stroke="#1a0800" strokeWidth="4"/>
        <line x1="72" y1="70" x2="50" y2="38" stroke="#1a0800" strokeWidth="4"/>
        {/* Flat canopy */}
        <ellipse cx="72" cy="28" rx="65" ry="28" fill="#1a0800"/>
        <ellipse cx="32" cy="48" rx="32" ry="14" fill="#1a0800"/>
        <ellipse cx="108" cy="43" rx="30" ry="13" fill="#1a0800"/>
      </svg>

      {/* Acacia tree right */}
      <svg style={{ position: 'absolute', bottom: '30%', right: '8%', opacity: 0.90 }}
        width="100" height="140" viewBox="0 0 100 140">
        <rect x="46" y="65" width="8" height="75" fill="#1a0800"/>
        <line x1="50" y1="70" x2="18" y2="48" stroke="#1a0800" strokeWidth="4"/>
        <line x1="50" y1="65" x2="80" y2="44" stroke="#1a0800" strokeWidth="4"/>
        <ellipse cx="50" cy="28" rx="46" ry="22" fill="#1a0800"/>
        <ellipse cx="20" cy="44" rx="22" ry="10" fill="#1a0800"/>
        <ellipse cx="78" cy="40" rx="20" ry="10" fill="#1a0800"/>
      </svg>

      {/* Giraffe silhouette right */}
      <svg style={{ position: 'absolute', bottom: '30%', right: '22%', opacity: 0.85 }}
        width="50" height="130" viewBox="0 0 50 130">
        {/* Neck */}
        <rect x="22" y="10" width="8" height="70" rx="4" fill="#1a0800"/>
        {/* Head */}
        <ellipse cx="26" cy="8" rx="7" ry="9" fill="#1a0800"/>
        {/* Horns */}
        <rect x="22" y="0" width="3" height="8" rx="1" fill="#1a0800"/>
        <rect x="28" y="0" width="3" height="8" rx="1" fill="#1a0800"/>
        {/* Body */}
        <ellipse cx="26" cy="90" rx="14" ry="22" fill="#1a0800"/>
        {/* Legs */}
        <rect x="14" y="108" width="6" height="22" rx="3" fill="#1a0800"/>
        <rect x="22" y="108" width="6" height="22" rx="3" fill="#1a0800"/>
        <rect x="30" y="108" width="6" height="20" rx="3" fill="#1a0800"/>
      </svg>

      {/* Small bush silhouettes on ground */}
      <svg style={{ position: 'absolute', bottom: '30%', left: '28%', opacity: 0.8 }}
        width="60" height="30" viewBox="0 0 60 30">
        <ellipse cx="15" cy="20" rx="15" ry="10" fill="#1a0800"/>
        <ellipse cx="35" cy="18" rx="20" ry="12" fill="#1a0800"/>
        <ellipse cx="52" cy="22" rx="10" ry="8" fill="#1a0800"/>
      </svg>

      {/* Ground grass texture */}
      <svg style={{ position: 'absolute', bottom: '29%', left: 0, right: 0, opacity: 0.6, width: '100%' }}
        height="20" viewBox="0 0 1280 20" preserveAspectRatio="none">
        {Array.from({ length: 80 }).map((_, i) => (
          <line key={i}
            x1={i * 16 + Math.random() * 8} y1="20"
            x2={i * 16 + Math.random() * 4 - 2} y2={8 + Math.random() * 8}
            stroke="#1a0800" strokeWidth="2"/>
        ))}
      </svg>

      {/* Dark overlay for form contrast */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.18)',
        pointerEvents: 'none',
      }} />

      {/* Login Card */}
      <section style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '400px',
        margin: '0 20px',
        background: 'rgba(5,12,22,0.82)',
        backdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,215,0,0.22)',
        borderRadius: '20px',
        padding: '44px 40px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05) inset',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '36px' }}>
          <div style={{ position: 'relative', marginBottom: '18px' }}>
            <div style={{
              position: 'absolute', inset: -10, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,215,0,0.30), transparent 70%)',
              animation: 'logoPulse 3s ease-in-out infinite',
            }} />
            <img
              src="/branding/psk-logo.png"
              alt="PSK Safaris"
              style={{
                width: 72, height: 72, borderRadius: '50%',
                border: '2px solid rgba(255,215,0,0.60)',
                boxShadow: '0 0 28px rgba(255,215,0,0.35)',
                position: 'relative', zIndex: 1,
                display: 'block',
              }}
            />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.98)', letterSpacing: '-0.3px' }}>
            PSK Safaris
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,215,0,0.65)', marginTop: '4px', fontWeight: 500, letterSpacing: '0.5px' }}>
            Admin Platform
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.40)',
              letterSpacing: '0.8px', textTransform: 'uppercase',
              display: 'block', marginBottom: '7px',
            }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              disabled={loading}
              style={{
                width: '100%', padding: '12px 14px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                color: 'rgba(255,255,255,0.92)',
                fontSize: '13px', outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,215,0,0.40)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.40)',
              letterSpacing: '0.8px', textTransform: 'uppercase',
              display: 'block', marginBottom: '7px',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
              style={{
                width: '100%', padding: '12px 14px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                color: 'rgba(255,255,255,0.92)',
                fontSize: '13px', outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,215,0,0.40)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(231,76,60,0.10)', border: '1px solid rgba(231,76,60,0.22)',
              borderRadius: '9px', padding: '10px 14px', marginBottom: '16px',
              fontSize: '12px', color: 'rgba(239,154,154,0.92)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: 'linear-gradient(135deg, rgba(255,215,0,0.20), rgba(255,149,0,0.14))',
              border: '1.5px solid rgba(255,215,0,0.40)',
              borderRadius: '10px',
              color: 'rgba(255,215,0,0.98)',
              fontSize: '13px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.3px',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.18s',
              boxShadow: '0 4px 20px rgba(255,149,0,0.15)',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <style>{`
          @keyframes logoPulse {
            0%, 100% { opacity: 0.55; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.08); }
          }
          input::placeholder { color: rgba(255,255,255,0.20); }
        `}</style>
      </section>
    </main>
  )
}
