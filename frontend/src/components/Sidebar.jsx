import { Logo } from './Logo'
import { IconGrid, IconShield, IconTrendingUp, IconPerson, IconSpark, IconBook } from './icons'

const ICONS = {
  'draft-table': IconGrid,
  'by-team': IconShield,
  'draft-value': IconTrendingUp,
  'player-cards': IconPerson,
  'ai-report': IconSpark,
  definitions: IconBook,
}

export function Sidebar({ tabs, activeTab, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo size={26} />
        <div className="sidebar-wordmark">
          <span className="sidebar-wordmark-the">THE</span>
          <span className="sidebar-wordmark-main">OVERALL PICK</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {tabs.map((t) => {
          const Icon = ICONS[t.id]
          const active = t.id === activeTab
          return (
            <button
              key={t.id}
              className={active ? 'sidebar-item sidebar-item-active' : 'sidebar-item'}
              onClick={() => onSelect(t.id)}
            >
              <span className="sidebar-item-icon">
                <Icon />
              </span>
              <span className="sidebar-item-label">{t.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
