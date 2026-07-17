import { Area, AreaChart, ResponsiveContainer } from 'recharts'

export function StatTile({ label, value, sub, sparkline, tone }) {
  const hasSparkline = Array.isArray(sparkline) && sparkline.filter((v) => v !== null && v !== undefined).length >= 2
  const toneClass = tone === 'good' ? ' stat-tile-value-good' : tone === 'bad' ? ' stat-tile-value-bad' : ''

  return (
    <div className="stat-tile">
      <div className="stat-tile-label">{label}</div>
      <div className={`stat-tile-value${toneClass}`}>{value}</div>
      {sub && <div className="stat-tile-sub">{sub}</div>}
      {hasSparkline && (
        <div className="stat-tile-sparkline">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkline.map((v, i) => ({ i, v }))} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="var(--gold)"
                strokeWidth={1.5}
                fill="url(#sparklineFill)"
                connectNulls
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
