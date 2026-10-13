const TYPE_STYLES = {
  Improve: { bg: '#FCE4D6', color: '#712B13' },
  Add:     { bg: '#EAF3DE', color: '#27500A' },
  Remove:  { bg: '#FCEBEB', color: '#791F1F' },
}

const PRIORITY_COLOR = {
  High:   'var(--color-danger)',
  Medium: 'var(--color-warning)',
  Low:    'var(--color-text-tertiary)',
}

export default function SuggestionCard({ suggestion, onApply, onRemove, isApplied = false }) {
  const { type, section, priority, before, after } = suggestion
  const typeStyle = TYPE_STYLES[type] || TYPE_STYLES.Improve

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: 'hidden',
        border: isApplied ? '1px solid var(--color-success)' : '1px solid var(--color-border)',
        boxShadow: isApplied ? '0 0 0 1px var(--color-success-bg)' : undefined,
        transition: 'all 0.2s ease',
      }}
    >

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-3) var(--space-4)',
        background: isApplied ? 'var(--color-success-bg)' : 'var(--color-bg-surface-2)',
        borderBottom: '1px solid var(--color-border-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{
            padding: '2px 10px', borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)',
            background: typeStyle.bg, color: typeStyle.color,
          }}>
            {type}
          </span>
          <span style={{
            fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)',
            color: 'var(--color-text-primary)'
          }}>
            {section}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {isApplied && (
            <span style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--color-success)',
              background: '#ffffff',
              padding: '2px 8px',
              borderRadius: '999px',
              border: '1px solid var(--color-success)',
            }}>
              ✓ Implemented
            </span>
          )}
          <span style={{ fontSize: 'var(--text-xs)', color: PRIORITY_COLOR[priority] }}>
            {priority} priority
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 'var(--space-4)' }}>
        {before && (
          <>
            <p style={{
              fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)',
              marginBottom: 'var(--space-1)'
            }}>
              Before
            </p>
            <p style={{
              fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)',
              background: 'var(--color-bg-surface-2)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-2) var(--space-3)',
              marginBottom: 'var(--space-3)',
              lineHeight: 'var(--line-normal)',
            }}>
              "{before}"
            </p>
          </>
        )}

        <p style={{
          fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)',
          marginBottom: 'var(--space-1)'
        }}>
          {before ? 'Recommended Optimization' : 'Suggested Addition'}
        </p>
        <p style={{
          fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)',
          background: 'var(--color-success-bg)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-2) var(--space-3)',
          marginBottom: 'var(--space-3)',
          lineHeight: 'var(--line-normal)',
        }}>
          {after}
        </p>

        {isApplied ? (
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              background: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-semibold)',
              border: '1px solid rgba(34,197,94,0.3)',
            }}>
              ✓ Active in Resume
            </div>
            <button
              className="btn btn-sm"
              onClick={() => onRemove && onRemove(suggestion)}
              style={{
                background: '#FEF2F2',
                color: '#DC2626',
                borderColor: '#FCA5A5',
                gap: '4px',
                fontSize: 'var(--text-xs)',
              }}
              title="Remove this implementation and restore original text"
            >
              ↩️ Remove
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onApply(suggestion)}
            style={{
              width: '100%',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            ⚡ Implement into Resume
          </button>
        )}
      </div>
    </div>
  )
}