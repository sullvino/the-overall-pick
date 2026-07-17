export function YearRangeSlider({ min, max, value, onChange }) {
  const [fromYear, toYear] = value
  const isFullRange = fromYear === min && toYear === max

  return (
    <div className="year-slider">
      <span className="year-slider-title">Draft years</span>
      <span className="year-slider-tag">{fromYear}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={fromYear}
        onChange={(e) => onChange([Math.min(Number(e.target.value), toYear), toYear])}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={toYear}
        onChange={(e) => onChange([fromYear, Math.max(Number(e.target.value), fromYear)])}
      />
      <span className="year-slider-tag">{toYear}</span>
      {!isFullRange && (
        <button className="year-slider-reset" onClick={() => onChange([min, max])}>
          Reset
        </button>
      )}
    </div>
  )
}
