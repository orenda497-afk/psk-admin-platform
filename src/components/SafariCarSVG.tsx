export default function SafariCarSVG() {
  return (
    <svg
      viewBox="0 0 200 120"
      xmlns="http://www.w3.org/2000/svg"
      className="psk-safari-car-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Main body */}
      <rect x="40" y="50" width="120" height="35" rx="8" fill="#f5f5f5" opacity="0.9" />
      
      {/* Cabin/Windshield */}
      <rect x="50" y="35" width="80" height="20" rx="4" fill="#e8e8e8" opacity="0.85" />
      
      {/* Windshield glass */}
      <rect x="52" y="37" width="35" height="16" rx="2" fill="#87ceeb" opacity="0.4" />
      <rect x="93" y="37" width="35" height="16" rx="2" fill="#87ceeb" opacity="0.4" />
      
      {/* Roof rack */}
      <rect x="55" y="30" width="70" height="4" rx="2" fill="#d4d4d4" opacity="0.7" />
      <circle cx="60" cy="28" r="2" fill="#999" opacity="0.6" />
      <circle cx="80" cy="28" r="2" fill="#999" opacity="0.6" />
      <circle cx="100" cy="28" r="2" fill="#999" opacity="0.6" />
      <circle cx="120" cy="28" r="2" fill="#999" opacity="0.6" />
      <circle cx="135" cy="28" r="2" fill="#999" opacity="0.6" />
      
      {/* Front bumper */}
      <rect x="38" y="82" width="8" height="12" rx="2" fill="#333" opacity="0.7" />
      <rect x="42" y="85" width="6" height="8" fill="#666" opacity="0.6" />
      
      {/* Headlights */}
      <circle cx="48" cy="60" r="3" fill="#ffeb3b" opacity="0.8" />
      <circle cx="48" cy="68" r="3" fill="#ffeb3b" opacity="0.8" />
      
      {/* Side mirror */}
      <rect x="35" y="58" width="3" height="8" fill="#666" opacity="0.7" />
      <rect x="33" y="56" width="7" height="4" fill="#888" opacity="0.6" />
      
      {/* Wheels */}
      <circle cx="65" cy="92" r="10" fill="#333" opacity="0.8" />
      <circle cx="65" cy="92" r="6" fill="#555" opacity="0.7" />
      <circle cx="65" cy="92" r="3" fill="#888" opacity="0.6" />
      
      <circle cx="135" cy="92" r="10" fill="#333" opacity="0.8" />
      <circle cx="135" cy="92" r="6" fill="#555" opacity="0.7" />
      <circle cx="135" cy="92" r="3" fill="#888" opacity="0.6" />
      
      {/* Door line */}
      <line x1="100" y1="50" x2="100" y2="82" stroke="#ccc" strokeWidth="1" opacity="0.5" />
      
      {/* Window line */}
      <line x1="75" y1="35" x2="125" y2="35" stroke="#bbb" strokeWidth="0.5" opacity="0.4" />
    </svg>
  )
}
