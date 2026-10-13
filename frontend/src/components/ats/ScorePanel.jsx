import ScoreRing from '../ui/ScoreRing'
import { scoreColor } from '../../utils/scoreColor'

export default function ScorePanel({ result, onAddKeyword }) {
  if (!result) return null

  const {
    atsScore,
    breakdown = [],
    keywords = { found: [], missing: [], present: [] },
    jobRole,
    shortlistProbability,
    shortlistTier,
    recruiterVerdict,
    roleChecklist = [],
    metricsFound = 0,
    actionVerbsFound = [],
  } = result

  const presentKeywords = keywords.found || keywords.present || []
  const missingKeywords = keywords.missing || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

      {/* Score ring + Shortlist verdict card */}
      <div className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {shortlistProbability && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
            marginBottom: 'var(--space-3)',
            background: shortlistTier === 'high' ? 'var(--color-success-bg)' : shortlistTier === 'medium' ? 'var(--color-warning-bg)' : 'var(--color-danger-bg)',
            color: shortlistTier === 'high' ? 'var(--color-success)' : shortlistTier === 'medium' ? 'var(--color-warning)' : 'var(--color-danger)',
            border: `1px solid ${shortlistTier === 'high' ? 'rgba(34,197,94,0.3)' : shortlistTier === 'medium' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}>
            <span>🎯 Shortlist Probability:</span>
            <span>{shortlistProbability}</span>
          </div>
        )}

        <ScoreRing score={atsScore} size={130} />

        <p style={{
          marginTop: 'var(--space-3)',
          fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)',
          color: scoreColor(atsScore)
        }}>
          {atsScore >= 75 ? 'Strong ATS Match · Ready for Top Screenings'
           : atsScore >= 50 ? 'Moderate Match · Keyword Gaps Identified'
           : 'Low ATS Match · Needs Structural Optimization'}
        </p>

        <p style={{
          fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)',
          marginTop: 'var(--space-1)', fontWeight: 'var(--weight-medium)'
        }}>
          Targeted for: <strong>{jobRole}</strong>
        </p>

        {recruiterVerdict && (
          <div style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-bg-surface-2)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'left',
            borderLeft: `3px solid ${scoreColor(atsScore)}`,
          }}>
            <p style={{ fontSize: '11px', fontWeight: 'var(--weight-bold)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '3px' }}>
              Recruiter & ATS Screening Verdict:
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
              {recruiterVerdict}
            </p>
          </div>
        )}
      </div>

      {/* Role Shortlisting Checklist */}
      {roleChecklist && roleChecklist.length > 0 && (
        <div className="card">
          <p style={{
            fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
            color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)'
          }}>
            Role Shortlisting Checklist
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {roleChecklist.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--color-bg-surface-2)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                <span style={{
                  fontSize: '14px',
                  lineHeight: 1,
                  color: item.status === 'passed' ? 'var(--color-success)' : 'var(--color-warning)',
                }}>
                  {item.status === 'passed' ? '✓' : '⚠️'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'var(--weight-medium)', color: 'var(--color-text-primary)' }}>
                    {item.label}
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breakdown bars */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <p style={{
          fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
          color: 'var(--color-text-primary)'
        }}>
          ATS Factor Breakdown
        </p>
        {breakdown.map(item => (
          <div key={item.label}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-1)'
            }}>
              <span>{item.label}</span>
              <span style={{ fontWeight: 'var(--weight-semibold)' }}>{item.value}%</span>
            </div>
            <div className="progress-track">
              <div
                className={`progress-fill ${
                  item.value >= 75 ? 'success' :
                  item.value >= 50 ? 'warning' : ''
                }`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Keyword pills */}
      <div className="card">
        <p style={{
          fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
          color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)'
        }}>
          Keywords Analysis for {jobRole}
        </p>
        <p style={{
          fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)',
          marginBottom: 'var(--space-3)'
        }}>
          Click any missing keyword to instantly add it to your editable resume.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {presentKeywords.map(k => (
            <span key={k} className="badge keyword-pill-present" title="Found in resume">
              ✓ {k}
            </span>
          ))}
          {missingKeywords.map(k => (
            <span
              key={k}
              className="badge keyword-pill-missing"
              style={{ cursor: onAddKeyword ? 'pointer' : 'default' }}
              onClick={() => onAddKeyword && onAddKeyword(k)}
              title="Click to add to resume"
            >
              + {k}
            </span>
          ))}
        </div>
        <p style={{
          fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)',
          marginTop: 'var(--space-3)'
        }}>
          Green = present in resume · Red = missing for {jobRole} (click + to add)
        </p>
      </div>
    </div>
  )
}