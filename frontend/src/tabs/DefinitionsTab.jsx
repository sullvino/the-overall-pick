import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import glossary from '../content/DEFINITIONS_GLOSSARY.md?raw'

export function DefinitionsTab() {
  return (
    <div className="definitions-tab">
      <div className="chart-card markdown-card">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{glossary}</ReactMarkdown>
      </div>
    </div>
  )
}
