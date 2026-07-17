const POSITIONS = ['C', 'LW', 'RW', 'D', 'G']

export function FilterBar({ filters, onChange }) {
  return (
    <div className="filter-bar">
      <label className="filter-control">
        <span>Position</span>
        <select value={filters.position} onChange={(e) => onChange({ ...filters, position: e.target.value })}>
          <option value="ALL">All</option>
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
