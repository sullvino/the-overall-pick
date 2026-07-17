export function TeamTopFive({ team }) {
  const byPpg = team.picks
    .filter((p) => p.is_nhler)
    .sort((a, b) => b.points_per_game - a.points_per_game)
    .slice(0, 5)

  const byValue = team.picks
    .filter((p) => p.valueOverExpectation !== null && p.valueOverExpectation !== undefined)
    .sort((a, b) => b.valueOverExpectation - a.valueOverExpectation)
    .slice(0, 5)

  const busts = team.picks
    .filter((p) => p.is_first_round_bust)
    .sort((a, b) => a.overall_pick - b.overall_pick)
    .slice(0, 5)

  return (
    <div className="top-five-grid">
      <TopFivePanel
        title="Top 5 by PPG"
        rows={byPpg}
        empty="No skaters with an NHL career yet."
        barColor="var(--series-1)"
        value={(p) => p.points_per_game}
        format={(v) => v.toFixed(3)}
        sub={(p) => `${p.draft_year} · Rd ${p.round} #${p.overall_pick}`}
      />
      <TopFivePanel
        title="Top 5 by Value Over Expectation"
        rows={byValue}
        empty="No eligible picks yet (see Value Over Expectation definition)."
        barColor="var(--series-2)"
        value={(p) => p.valueOverExpectation}
        format={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)} pts/82`}
        sub={(p) => `${p.draft_year} · Rd ${p.round} #${p.overall_pick}`}
      />
      <TopFivePanel
        title="1st Round Busts"
        rows={busts}
        empty="No confirmed 1st round busts."
        barColor="var(--series-6)"
        value={(p) => 33 - p.overall_pick}
        format={(_v, p) => `#${p.overall_pick} overall`}
        sub={(p) => `${p.draft_year} · ${p.games_played ? `${p.games_played} GP, never a regular` : 'never played'}`}
      />
    </div>
  )
}

function TopFivePanel({ title, rows, empty, barColor, value, format, sub }) {
  const maxVal = rows.length ? Math.max(...rows.map(value), 0.0001) : 1

  return (
    <div className="chart-card top-five-panel">
      <h3>{title}</h3>
      {rows.length === 0 ? (
        <p className="chart-empty">{empty}</p>
      ) : (
        <ul className="top-five-list">
          {rows.map((p) => {
            const v = value(p)
            const width = Math.max(4, (v / maxVal) * 100)
            return (
              <li key={p.pick_id}>
                <div className="top-five-row">
                  {p.headshot_url ? (
                    <img src={p.headshot_url} alt="" className="top-five-headshot" onError={(e) => { e.currentTarget.style.visibility = 'hidden' }} />
                  ) : (
                    <div className="top-five-headshot top-five-headshot-placeholder" />
                  )}
                  <div className="top-five-info">
                    <div className="top-five-name">
                      {p.player_name}
                      {p.is_elite ? (
                        <span className="elite-badge">Elite</span>
                      ) : p.skater_tier === 4 ? (
                        <span className="star-badge">Star</span>
                      ) : null}
                    </div>
                    <div className="top-five-sub">{sub(p)}</div>
                  </div>
                  <div className="top-five-value">{format(v, p)}</div>
                </div>
                <div className="databar-track">
                  <div className="databar-fill" style={{ width: `${width}%`, background: barColor }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
