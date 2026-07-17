const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function IconGrid() {
  return (
    <svg {...common}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

export function IconShield() {
  return (
    <svg {...common}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    </svg>
  )
}

export function IconTrendingUp() {
  return (
    <svg {...common}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  )
}

export function IconPerson() {
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  )
}

export function IconSpark() {
  return (
    <svg {...common}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    </svg>
  )
}

export function IconBook() {
  return (
    <svg {...common}>
      <path d="M4 4.5C4 3.7 4.7 3 5.5 3H12v16H5.5C4.7 19 4 19.7 4 20.5z" />
      <path d="M20 4.5C20 3.7 19.3 3 18.5 3H12v16h6.5c.8 0 1.5.7 1.5 1.5z" />
    </svg>
  )
}

export function IconMenu() {
  return (
    <svg {...common}>
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </svg>
  )
}

export function IconX() {
  return (
    <svg {...common}>
      <path d="M5 5l14 14" />
      <path d="M19 5L5 19" />
    </svg>
  )
}
