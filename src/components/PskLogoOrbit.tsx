interface PskLogoOrbitProps {
  size?: 'sm' | 'md' | 'lg'
  showOrbit?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
}

export default function PskLogoOrbit({
  size = 'md',
  showOrbit = true,
  className = '',
}: PskLogoOrbitProps) {
  return (
    <div className={`psk-logo-orbit ${sizeClasses[size]} ${className}`} aria-label="PSK Safaris">
      {showOrbit && (
        <>
          <span className="psk-logo-orbit-ring psk-logo-orbit-ring--outer" aria-hidden="true" />
          <span className="psk-logo-orbit-ring psk-logo-orbit-ring--inner" aria-hidden="true" />
          <span className="psk-logo-car-emoji" aria-hidden="true">🚗</span>
        </>
      )}
      <img
        src="/branding/psk-safari-logo.png"
        alt="PSK Safaris logo"
        className="relative z-10 w-full h-full rounded-full object-cover psk-logo-image"
      />
    </div>
  )
}
