import { useState } from 'react'
import SuggestionCard from './SuggestionCard'
import toast from 'react-hot-toast'

const FILTERS = ['All', 'Improve', 'Add', 'Remove']

export default function SuggestionsPanel({
  suggestions = [],
  appliedIds = [],
  onApplySuggestion,
  onApplyAll,
}) {
  const [filter, setFilter] = useState('All')

  const visible = filter === 'All'
    ? suggestions
    : suggestions.filter(s => s.type === filter)

  function handleSingleApply(suggestion) {
    if (onApplySuggestion) {
      onApplySuggestion(suggestion)
    } else {
      toast.success(`Suggestion applied: ${suggestion.section}`)
    }
  }

  function handleAllApply() {
    if (onApplyAll) {
      onApplyAll()
    } else {
      toast.success('All suggestions applied!')
    }
  }

  const allApplied = suggestions.length > 0 && appliedIds.length >= suggestions.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap',
        gap: 'var(--space-3)',
      }}>
        <p style={{
          fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)',
          color: 'var(--color-text-primary)',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <span>AI suggestions</span>
          <span style={{
            padding: '2px 8px',
            background: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
          }}>
            {appliedIds.length}/{suggestions.length} implemented
          </span>
        </p>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {FILTERS.map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 12px',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-medium)',
                borderRadius: 'var(--radius-full)',
                border: 'none', cursor: 'pointer',
                background: filter === f
                  ? 'var(--color-primary)'
                  : 'var(--color-primary-subtle)',
                color: filter === f
                  ? '#fff'
                  : 'var(--color-primary)',
                transition: 'background var(--transition-fast)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {visible.map(s => {
        const isApplied = appliedIds.includes(s.id)
        return (
          <SuggestionCard
            key={s.id}
            suggestion={s}
            onApply={handleSingleApply}
            isApplied={isApplied}
          />
        )
      })}

      {/* Apply all */}
      {suggestions.length > 0 && (
        <button
          className="btn btn-primary"
          style={{ width: '100%', gap: '8px', padding: '12px' }}
          onClick={handleAllApply}
          disabled={allApplied}
        >
          {allApplied ? (
            <>✓ All {suggestions.length} AI Suggestions Implemented</>
          ) : (
            <>⚡ Implement All Suggestions ({suggestions.length}) into Resume</>
          )}
        </button>
      )}
    </div>
  )
}