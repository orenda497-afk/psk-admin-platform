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
      backgroundImage: 'url(/branding/kilimanjaro-defender-bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />

      <section style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '420px',
        margin: '0 20px',
        background: 'rgba(8,20,30,0.75)',
        backdropFilter: 'blur(28px)',
        border: '1px solid rgba(255,215,0,0.18)',
        borderRadius: '20px',
        padding: '44px 40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '36px' }}>
          <div style={{ position: 'relative', marginBottom: '18px' }}>
            <div style={{
              position: 'absolute', inset: -10, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,215,0,0.28), transparent 70%)',
              animation: 'logoPulse 3s ease-in-out infinite',
            }} />
            <img
              src="/branding/psk-logo.png"
              alt="PSK Safaris"
              style={{
                width: 72, height: 72, borderRadius: '50%',
                border: '2px solid rgba(255,215,0,0.55)',
                boxShadow: '0 0 24px rgba(255,215,0,0.28)',
                position: 'relative', zIndex: 1,
              }}
            />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.3px' }}>
            PSK Safaris
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,215,0,0.60)', marginTop: '4px', fontWeight: 500 }}>
            Admin Platform
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: '7px' }}>
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
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                color: 'rgba(255,255,255,0.90)',
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,215,0,0.35)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: '7px' }}>
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
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                color: 'rgba(255,255,255,0.90)',
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,215,0,0.35)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(231,76,60,0.10)', border: '1px solid rgba(231,76,60,0.22)',
              borderRadius: '9px', padding: '10px 14px', marginBottom: '16px',
              fontSize: '12px', color: 'rgba(239,154,154,0.90)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: 'linear-gradient(135deg, rgba(255,215,0,0.18), rgba(255,149,0,0.12))',
              border: '1.5px solid rgba(255,215,0,0.35)',
              borderRadius: '10px',
              color: 'rgba(255,215,0,0.95)',
              fontSize: '13px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.3px',
              opacity: loading ? 0.7 : 1,
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
          input::placeholder { color: rgba(255,255,255,0.22); }
        `}</style>
      </section>
    </main>
  )
}
