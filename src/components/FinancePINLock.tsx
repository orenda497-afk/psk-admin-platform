import { useState } from 'react'
import PskLogoOrbit from './PskLogoOrbit'

interface FinancePINLockProps {
  onUnlock: () => void
}

const CORRECT_PIN = '1234'

export default function FinancePINLock({ onUnlock }: FinancePINLockProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [lockoutTime, setLockoutTime] = useState<number | null>(null)

  const handleDigit = (digit: string) => {
    if (locked) return
    if (pin.length < 4) {
      setPin(pin + digit)
    }
  }

  const handleBackspace = () => {
    if (locked) return
    setPin(pin.slice(0, -1))
  }

  const handleSubmit = () => {
    if (locked) return
    
    if (pin === CORRECT_PIN) {
      setPin('')
      setError(false)
      setAttempts(0)
      onUnlock()
    } else {
      setError(true)
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      
      if (newAttempts >= 3) {
        setLocked(true)
        setLockoutTime(10 * 60) // 10 minutes
        
        const interval = setInterval(() => {
          setLockoutTime(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(interval)
              setLocked(false)
              setLockoutTime(null)
              setAttempts(0)
              return null
            }
            return prev - 1
          })
        }, 1000)
      }
      
      setPin('')
      setTimeout(() => setError(false), 800)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-[420px] p-8 bg-gradient-to-b from-[#0f1b2e] to-[#0a1118] rounded-2xl border border-slate-700/50 shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <PskLogoOrbit size="md" />
            <div className="absolute inset-0 rounded-full blur-xl bg-amber-500/20 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center text-xl font-bold text-white mb-2">Finance Protected</h1>
        <p className="text-center text-sm text-slate-400 mb-8">Enter PIN to access Finance</p>

        {/* Lockout Message */}
        {locked && lockoutTime !== null && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
            <p className="text-red-400 font-semibold mb-2">Too many attempts</p>
            <p className="text-red-300 text-sm">Locked for {formatTime(lockoutTime)}</p>
          </div>
        )}

        {/* PIN Dots */}
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all ${
                i < pin.length
                  ? error
                    ? 'bg-red-500 scale-125'
                    : 'bg-amber-400'
                  : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num.toString())}
              disabled={locked || pin.length >= 4}
              className="py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleDigit('0')}
            disabled={locked || pin.length >= 4}
            className="col-span-2 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            disabled={locked || pin.length === 0}
            className="py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            ⌫
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={locked || pin.length !== 4}
          className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
        >
          {locked ? 'Locked' : 'Unlock'}
        </button>

        {/* Demo Hint */}
        <p className="text-center text-xs text-slate-500 mt-6">Demo PIN: 1234</p>
      </div>
    </div>
  )
}
