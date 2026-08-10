import { useState, useEffect } from 'react'

interface FinancePINLockProps {
  onUnlock: () => void
  onCancel?: () => void
}

export default function FinancePINLock({ onUnlock, onCancel }: FinancePINLockProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)

  const CORRECT_PIN = '1234'
  const MAX_ATTEMPTS = 3
  const LOCKOUT_TIME = 10 * 60 * 1000 // 10 minutes

  useEffect(() => {
    if (lockedUntil) {
      const timer = setInterval(() => {
        const now = Date.now()
        if (now >= lockedUntil) {
          setLockedUntil(null)
          setWrongAttempts(0)
          setError('')
        }
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [lockedUntil])

  const handleDigit = (digit: string) => {
    if (lockedUntil) return
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      setError('')

      // Auto-submit when 4 digits entered
      if (newPin.length === 4) {
        setTimeout(() => validatePin(newPin), 100)
      }
    }
  }

  const handleBackspace = () => {
    if (lockedUntil) return
    setPin(pin.slice(0, -1))
    setError('')
  }

  const validatePin = (pinToCheck: string) => {
    if (pinToCheck === CORRECT_PIN) {
      setPin('')
      setError('')
      setWrongAttempts(0)
      onUnlock()
    } else {
      // Wrong PIN
      setShake(true)
      setError('Incorrect PIN')
      const newAttempts = wrongAttempts + 1
      setWrongAttempts(newAttempts)

      // Clear PIN after shake
      setTimeout(() => {
        setPin('')
        setShake(false)
      }, 900)

      // Lockout after 3 wrong attempts
      if (newAttempts >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_TIME)
        setError('Too many attempts. Locked for 10 minutes.')
      }
    }
  }

  const getRemainingTime = () => {
    if (!lockedUntil) return ''
    const remaining = Math.ceil((lockedUntil - Date.now()) / 1000)
    const minutes = Math.floor(remaining / 60)
    const seconds = remaining % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(5,15,24,0.92)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <div className="flex flex-col items-center gap-5 max-w-sm w-full px-6">
        {/* PSK Logo with Glow */}
        <div className="relative mb-2">
          {/* Glow Background */}
          <div className="absolute inset-0 flex justify-center">
            <div 
              className="w-16 h-16 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,215,0,0.32), rgba(255,149,0,0.12) 50%, transparent 70%)',
                animation: 'pulse 3s ease-in-out infinite'
              }}
            />
          </div>
          
          {/* Logo Circle */}
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-2xl relative z-10"
            style={{
              background: 'linear-gradient(135deg, #FF9500, #FFD700 45%, #2D5F3F)',
              border: '2px solid rgba(255,215,0,0.45)',
              boxShadow: '0 0 24px rgba(255,215,0,0.2)',
            }}
          >
            P
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-white text-center">
          Finance is protected
        </h2>

        {/* Subtitle */}
        <p className="text-xs text-slate-400 text-center">
          Enter your 4-digit PIN to continue
        </p>

        {/* PIN Indicators */}
        <div className="flex gap-3 justify-center">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-all ${
                shake ? 'animate-shake' : ''
              }`}
              style={{
                background: pin.length > idx
                  ? error
                    ? '#ef4444'
                    : '#fbbf24'
                  : 'rgba(255,255,255,0.1)',
              }}
            />
          ))}
        </div>

        {/* Error Message */}
        <div className="h-4 text-xs text-red-400 text-center">
          {error && <span>{error}</span>}
          {lockedUntil && <span>Locked: {getRemainingTime()}</span>}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-2 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num.toString())}
              disabled={!!lockedUntil}
              className="py-3 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
              style={{
                background: 'rgba(255,255,255,0.055)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: 'rgba(255,255,255,0.82)',
              }}
            >
              {num}
            </button>
          ))}
        </div>

        {/* 0 and Backspace Row */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <div /> {/* Empty cell */}
          <button
            onClick={() => handleDigit('0')}
            disabled={!!lockedUntil}
            className="py-3 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
            style={{
              background: 'rgba(255,255,255,0.055)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.82)',
            }}
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            disabled={!!lockedUntil}
            className="py-3 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
            style={{
              background: 'rgba(255,255,255,0.055)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.82)',
            }}
          >
            ⌫
          </button>
        </div>

        {/* Cancel Link */}
        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-200 transition"
        >
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.65;
          }
          50% {
            transform: scale(1.07);
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  )
}
