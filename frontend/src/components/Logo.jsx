// Board-position grid mark: 4x4 squares, one highlighted in brand gold --
// "your slot on the draft board." Highlighted square position is decorative.
export function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true" className="logo-mark">
      <rect x="0" y="0" width="7" height="7" fill="var(--border)" />
      <rect x="9" y="0" width="7" height="7" fill="var(--border)" />
      <rect x="18" y="0" width="7" height="7" fill="var(--border)" />
      <rect x="27" y="0" width="7" height="7" fill="var(--border)" />
      <rect x="0" y="9" width="7" height="7" fill="var(--border)" />
      <rect x="9" y="9" width="7" height="7" fill="var(--gold)" />
      <rect x="18" y="9" width="7" height="7" fill="var(--border)" />
      <rect x="27" y="9" width="7" height="7" fill="var(--border)" />
      <rect x="0" y="18" width="7" height="7" fill="var(--border)" />
      <rect x="9" y="18" width="7" height="7" fill="var(--border)" />
      <rect x="18" y="18" width="7" height="7" fill="var(--border)" />
      <rect x="27" y="18" width="7" height="7" fill="var(--border)" />
      <rect x="0" y="27" width="7" height="7" fill="var(--border)" />
      <rect x="9" y="27" width="7" height="7" fill="var(--border)" />
      <rect x="18" y="27" width="7" height="7" fill="var(--border)" />
      <rect x="27" y="27" width="7" height="7" fill="var(--border)" />
    </svg>
  )
}
