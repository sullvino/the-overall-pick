export function YearRangeSlider({ min, max, value, onChange }) {
  const [fromYear, toYear] = value

  return (
    <div className="year-slider">
      <div className="year-slider-header">
        <span className="year-slider-title">Draft years</span>
        <span className="year-slider-value">
          {fromYear}&ndash;{toYear}
        </span>
      </div>
      <div className="year-slider-row">
        <span className="year-slider-tag">From</span>
        <input
          type="range"
          min={min}
          max={max}
          value={fromYear}
          onChange={(e) => onChange([Math.min(Number(e.target.value), toYear), toYear])}
        />
      </div>
      <div className="year-slider-row">
        <span className="year-slider-tag">To</span>
        <input
          type="range"
          min={min}
          max={max}
          value={toYear}
          onChange={(e) => onChange([fromYear, Math.max(Number(e.target.value), fromYear)])}
        />
      </div>
      {(fromYear !== min || toYear !== max) && (
        <button className="year-slider-reset" onClick={() => onChange([min, max])}>
          Reset to full range
        </button>
      )}
    </div>
  )
}
