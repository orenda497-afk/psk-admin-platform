import { useState } from 'react'
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import PskLogoOrbit from '../components/PskLogoOrbit'

interface LoginPageProps {
  onLogin: (email: string) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('admin@psksafaris.com')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    window.setTimeout(() => {
      if (email && password) {
        onLogin(email)
      } else {
        setError('Enter your email address and password to continue.')
      }
      setLoading(false)
    }, 500)
  }

  return (
    <main 
      className="min-h-screen flex items-center justify-center overflow-hidden p-5 sm:p-8 relative"
      style={{
        backgroundImage: 'url(/branding/mount-kenya-defender.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Subtle overlay for form contrast */}
      <div className="absolute inset-0 bg-black/20 z-0" />

      <section 
        className="psk-login-card-transparent relative z-10 w-full max-w-[520px] p-7 sm:p-10"
        style={{
          backgroundColor: 'rgba(9, 26, 41, 0.65)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(160, 218, 239, 0.3)',
          borderRadius: '24px',
          boxShadow: '0 28px 90px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05) inset'
        }}
      >
        <header className="flex flex-col items-center text-center">
          <PskLogoOrbit size="lg" className="mb-7" />
          <h1 className="text-[2rem] sm:text-[2.35rem] font-extrabold tracking-[-0.03em] text-white leading-tight">
            PSK Safaris
          </h1>
          <p className="mt-2 text-sm sm:text-base font-medium tracking-wide text-sky-300">
            Admin Platform
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-9 space-y-5">
          <div>
            <label htmlFor="email" className="psk-login-label">
              Email
            </label>
            <div className="psk-login-input-wrap">
              <Mail size={19} className="psk-login-input-icon" aria-hidden="true" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="psk-login-input"
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="psk-login-label">
              Password
            </label>
            <div className="psk-login-input-wrap">
              <LockKeyhole size={19} className="psk-login-input-icon" aria-hidden="true" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="psk-login-input"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="psk-login-submit"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="psk-login-demo-note">
          <ShieldCheck size={18} aria-hidden="true" />
          <span>Demo: admin@psksafaris.com or faith@psksafaris.co.ke</span>
        </div>
      </section>
    </main>
  )
}
