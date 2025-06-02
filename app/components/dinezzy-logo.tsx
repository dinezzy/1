export function DinezzyLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer circle */}
      <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" fill="none" />

      {/* Chef hat */}
      <path
        d="M25 35 C25 25, 35 20, 45 25 C50 15, 60 15, 65 25 C75 20, 85 25, 85 35 C85 40, 80 45, 75 45 L35 45 C30 45, 25 40, 25 35 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Hat band */}
      <ellipse cx="55" cy="45" rx="25" ry="8" stroke="currentColor" strokeWidth="2" fill="none" />

      {/* Face outline */}
      <ellipse cx="55" cy="60" rx="18" ry="20" stroke="currentColor" strokeWidth="2" fill="none" />

      {/* Mustache */}
      <path
        d="M45 65 C50 62, 55 62, 60 65 C62 67, 58 67, 55 65 C55 65, 50 67, 45 65"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Collar/shirt */}
      <path d="M37 80 L55 85 L73 80 L70 95 L40 95 Z" stroke="currentColor" strokeWidth="2" fill="none" />

      {/* Collar lines */}
      <path d="M37 80 L55 75 L73 80" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  )
}
