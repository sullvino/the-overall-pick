// Same soft champagne-gold ramp as the probability matrix and Draft Table
// heatmap, but on a single shared scale across both columns (not normalized
// per column) since Forward/Defenseman are the same unit here -- the color
// itself should show that forwards outproduce defensemen, not hide it.
const HEAT_STEPS = ['#faf4e6', '#f0e2bc', '#e2c988', '#d1ac57', '#b8903a', '#9c7728']

function heatColor(v, max) {
  if (v <= 0) return HEAT_STEPS[0]
  const t = Math.min(1, v / max)
  const idx = 1 + Math.min(HEAT_STEPS.length - 2, Math.floor(t * (HEAT_STEPS.length - 1)))
  return HEAT_STEPS[idx]
}

function textColorFor(v, max) {
  if (v <= 0) return 'var(--text-secondary)'
  const t = Math.min(1, v / max)
  return t > 0.45 ? '#ffffff' : 'var(--text-primary)'
}

function subTextColorFor(v, max) {
  if (v <= 0) return 'var(--text-muted)'
  const t = Math.min(1, v / max)
  return t > 0.45 ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'
}

export function DraftValueHeatmap({ data }) {
  const max = Math.max(0.1, ...data.flatMap((d) => [d.Forward, d.Defenseman]))

  return (
    <div className="table-scroll">
      <table className="value-heatmap">
        <thead>
          <tr>
            <th>Pick range</th>
            <th>Forward</th>
            <th>Defenseman</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.bucket}>
              <td className="value-heatmap-row-label">{d.bucket}</td>
              <td style={{ background: heatColor(d.Forward, max), color: textColorFor(d.Forward, max) }}>
                <div className="value-heatmap-val">{d.Forward}</div>
                <div className="value-heatmap-n" style={{ color: subTextColorFor(d.Forward, max) }}>
                  n={d.forwardN}
                </div>
              </td>
              <td style={{ background: heatColor(d.Defenseman, max), color: textColorFor(d.Defenseman, max) }}>
                <div className="value-heatmap-val">{d.Defenseman}</div>
                <div className="value-heatmap-n" style={{ color: subTextColorFor(d.Defenseman, max) }}>
                  n={d.defensemanN}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
