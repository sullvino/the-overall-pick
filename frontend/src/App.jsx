import { useEffect, useMemo, useState } from 'react'
import { useDraftData } from './hooks/useDraftData'
import { DraftTableTab } from './tabs/DraftTableTab'
import { ByTeamTab } from './tabs/ByTeamTab'
import { DraftValueTab } from './tabs/DraftValueTab'
import { PlayerCardTab } from './tabs/PlayerCardTab'
import { AIReportBuilderTab } from './tabs/AIReportBuilderTab'
import { DefinitionsTab } from './tabs/DefinitionsTab'
import { YearRangeSlider } from './components/YearRangeSlider'
import { Sidebar } from './components/Sidebar'
import { HeaderPattern } from './components/HeaderPattern'
import './App.css'

const TABS = [
  { id: 'player-cards', label: 'Player Cards' },
  { id: 'by-team', label: 'By Team' },
  { id: 'draft-value', label: 'Draft Value' },
  { id: 'draft-table', label: 'Draft Table' },
  { id: 'ai-report', label: 'AI Report Builder' },
  { id: 'definitions', label: 'Definitions' },
]

// Only these tabs read the global year-range slider -- Player Cards, AI Report
// Builder, and Definitions don't filter by it, so hide it there.
const TABS_WITH_YEAR_SLIDER = new Set(['draft-table', 'by-team', 'draft-value'])

export default function App() {
  const { rows, error, loading } = useDraftData()
  const [activeTab, setActiveTab] = useState('player-cards')

  const yearBounds = useMemo(() => {
    if (!rows || rows.length === 0) return [2015, 2025]
    const years = rows.map((r) => r.draft_year)
    return [Math.min(...years), Math.max(...years)]
  }, [rows])

  const [yearRange, setYearRange] = useState(null)
  // Default the slider to the full data range once it's known, without
  // clobbering a selection the user already made.
  useEffect(() => {
    if (rows && rows.length > 0 && yearRange === null) {
      setYearRange(yearBounds)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  const effectiveYearRange = yearRange || yearBounds

  if (error) {
    return (
      <div className="page-shell">
        <p className="error-banner">Couldn't load draft data: {error.message}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page-shell">
        <p className="loading-banner">Loading draft data&hellip;</p>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar tabs={TABS} activeTab={activeTab} onSelect={setActiveTab} />

      <div className="page">
        <header className="page-header">
          <HeaderPattern />
          <div className="page-header-title">
            <h1>{TABS.find((t) => t.id === activeTab)?.label}</h1>
          </div>
          <p>
            {rows.length.toLocaleString()} picks loaded, {yearBounds[0]}&ndash;{yearBounds[1]}
          </p>
        </header>

        {TABS_WITH_YEAR_SLIDER.has(activeTab) && (
          <YearRangeSlider min={yearBounds[0]} max={yearBounds[1]} value={effectiveYearRange} onChange={setYearRange} />
        )}

        <main>
          {activeTab === 'draft-table' && <DraftTableTab rows={rows} yearRange={effectiveYearRange} />}
          {activeTab === 'by-team' && <ByTeamTab rows={rows} years={yearBounds} yearRange={effectiveYearRange} />}
          {activeTab === 'draft-value' && <DraftValueTab rows={rows} yearRange={effectiveYearRange} />}
          {activeTab === 'player-cards' && <PlayerCardTab rows={rows} />}
          {activeTab === 'ai-report' && <AIReportBuilderTab />}
          {activeTab === 'definitions' && <DefinitionsTab />}
        </main>
      </div>
    </div>
  )
}
