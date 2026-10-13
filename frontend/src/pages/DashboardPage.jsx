// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth }     from '../context/AuthContext'
import { timeAgo }     from '../utils/formatDate'
import { scoreBadgeVariant } from '../utils/scoreColor'
import resumeService   from '../services/resumeService'
import toast           from 'react-hot-toast'

function scoreColor(score) {
  if (score >= 75) return 'var(--color-success)'
  if (score >= 50) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

function scoreBg(score) {
  if (score >= 75) return 'var(--color-success-bg)'
  if (score >= 50) return 'var(--color-warning-bg)'
  return 'var(--color-danger-bg)'
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const currentUserId = user?._id || user?.id || user?.email;
  const userCacheKey = currentUserId ? `rozgaar_resumes_cache_${currentUserId}` : null;

  const [history, setHistory] = useState(() => {
    if (!userCacheKey) return [];
    try {
      const cached = JSON.parse(localStorage.getItem(userCacheKey) || '[]');
      if (Array.isArray(cached) && cached.length > 0) {
        return cached.map(r => ({
          id: r._id || r.id,
          filename: r.fileName || r.filename || 'resume.pdf',
          role: r.role || r.jobRole || 'Software Engineer',
          atsScore: r.atsScore || 0,
          jdMatch: r.jdMatch || 0,
          source: r.source || 'upload',
          createdAt: r.createdAt || new Date().toISOString(),
          parsedData: r.parsedData,
          atsResult: r.atsResult,
        }));
      }
    } catch (e) {}
    return [];
  });
  const [search,  setSearch]  = useState('')
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Fetch real resumes strictly for current logged-in user from MongoDB and user-scoped cache
  useEffect(() => {
    async function loadUserResumes() {
      if (!currentUserId) {
        setHistory([]);
        return;
      }

      let cachedItems = [];
      try {
        const cached = JSON.parse(localStorage.getItem(userCacheKey) || '[]');
        if (Array.isArray(cached)) {
          cachedItems = cached.map(r => ({
            id: r._id || r.id,
            filename: r.fileName || r.filename || 'resume.pdf',
            role: r.role || r.jobRole || 'Software Engineer',
            atsScore: r.atsScore || 0,
            jdMatch: r.jdMatch || 0,
            source: r.source || 'upload',
            createdAt: r.createdAt || new Date().toISOString(),
            parsedData: r.parsedData,
            atsResult: r.atsResult,
          }));
        }
      } catch (e) {}

      try {
        setLoadingHistory(true);
        const res = await resumeService.getResumes();
        let apiItems = [];
        if (res?.data && Array.isArray(res.data)) {
          apiItems = res.data.map(r => ({
            id: r._id,
            filename: r.fileName || 'resume.pdf',
            role: r.atsResult?.jobRole || r.jobRole || 'Software Engineer',
            atsScore: r.atsScore || 0,
            jdMatch: r.atsResult?.jdMatch?.score || 0,
            source: r.source || 'upload',
            createdAt: r.createdAt,
            parsedData: r.parsedData,
            atsResult: r.atsResult,
          }));
        }

        // Merge API resumes with user-scoped cache, deduplicating by ID or filename
        const combinedMap = new Map();
        for (const item of apiItems) {
          combinedMap.set(item.id || item.filename, item);
        }
        for (const item of cachedItems) {
          if (!combinedMap.has(item.id) && !combinedMap.has(item.filename)) {
            combinedMap.set(item.id || item.filename, item);
          }
        }
        const merged = Array.from(combinedMap.values()).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setHistory(merged);
        if (userCacheKey && merged.length > 0) {
          localStorage.setItem(userCacheKey, JSON.stringify(merged));
        }
      } catch (err) {
        console.warn('Could not load user resumes from MongoDB:', err.message);
        if (cachedItems.length > 0) {
          setHistory(cachedItems);
        }
      } finally {
        setLoadingHistory(false);
      }
    }
    loadUserResumes();
  }, [currentUserId]);

  const name      = user?.name || 'there'
  const initials  = name.slice(0, 2).toUpperCase()
  const bestScore = history.length > 0 ? Math.max(...history.map(r => r.atsScore)) : 0
  const avgJd     = history.length > 0 ? Math.round(history.reduce((a, r) => a + r.jdMatch, 0) / history.length) : 0
  const bestEntry = history.find(r => r.atsScore === bestScore)

  const filtered = history.filter(r =>
    r.filename.toLowerCase().includes(search.toLowerCase()) ||
    r.role.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id) {
    try {
      if (typeof id === 'string' && !id.startsWith('local_') && id.length > 10) {
        await resumeService.deleteResume(id);
      }
    } catch (err) {
      console.warn('Could not delete resume on server:', err.message);
    }
    setHistory(prev => {
      const next = prev.filter(r => r.id !== id);
      if (userCacheKey) {
        try {
          const cached = JSON.parse(localStorage.getItem(userCacheKey) || '[]');
          const updatedCache = cached.filter(r => (r._id || r.id) !== id);
          localStorage.setItem(userCacheKey, JSON.stringify(updatedCache));
        } catch (e) {}
      }
      return next;
    });
    toast.success('Resume removed', { position: 'top-center' });
  }

  return (
    <div className="container" style={{ paddingBlock: 'var(--space-8)' }}>
      <div style={{
        display:             'grid',
        gridTemplateColumns: '1fr 280px',
        gap:                 'var(--space-8)',
        alignItems:          'start',
      }}>

        {/* ══ LEFT COLUMN ══ */}
        <div>

          {/* Greeting */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h2 style={{ marginBottom: 'var(--space-1)' }}>
              Hello, {name.split(' ')[0]} 👋
            </h2>
            <p className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>
              Here's how your resumes are performing
            </p>
          </div>

          {/* ── Stat cards ── */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap:                 'var(--space-4)',
            marginBottom:        'var(--space-8)',
          }}>

            {/* Best ATS score */}
            <div className="stat-card">
              <div className="stat-label">Best ATS score</div>
              <div className="stat-value" style={{ color: scoreColor(bestScore) }}>
                {bestScore}
              </div>
              <p style={{
                fontSize:  'var(--text-xs)',
                color:     'var(--color-text-tertiary)',
                marginTop: 'var(--space-1)',
              }}>
                {bestEntry?.role || '—'}
              </p>
            </div>

            {/* Resumes analyzed */}
            <div className="stat-card">
              <div className="stat-label">Resumes analyzed</div>
              <div className="stat-value">{history.length}</div>
              <p style={{
                fontSize:  'var(--text-xs)',
                color:     'var(--color-text-tertiary)',
                marginTop: 'var(--space-1)',
              }}>
                across {new Set(history.map(r => r.role)).size} roles
              </p>
            </div>

            {/* Avg JD match */}
            <div className="stat-card">
              <div className="stat-label">Avg JD match</div>
              <div className="stat-value">{avgJd}%</div>
              <p style={{
                fontSize:  'var(--text-xs)',
                color:     'var(--color-text-tertiary)',
                marginTop: 'var(--space-1)',
              }}>
                last 30 days
              </p>
            </div>
          </div>

          {/* ── History table ── */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              marginBottom:   'var(--space-4)',
              flexWrap:       'wrap',
              gap:            'var(--space-3)',
            }}>
              <h3 style={{ fontSize: 'var(--text-md)' }}>
                Resume history
              </h3>
              <input
                className="input"
                style={{ width: 220 }}
                placeholder="Search by file or role..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div style={{
              background:   'var(--color-bg-surface)',
              border:       '1px solid var(--color-border-surface)',
              borderRadius: 'var(--radius-lg)',
              overflow:     'hidden',
            }}>

              {/* Table header */}
              <div style={{
                display:             'grid',
                gridTemplateColumns: '2fr 1.2fr 80px 80px 100px 80px',
                padding:             'var(--space-3) var(--space-5)',
                background:          'var(--color-bg-surface-2)',
                borderBottom:        '1px solid var(--color-border-surface)',
              }}>
                {['File', 'Role', 'ATS', 'JD match', 'Date', 'Actions'].map(h => (
                  <span key={h} style={{
                    fontSize:      'var(--text-xs)',
                    fontWeight:    'var(--weight-medium)',
                    color:         'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}>
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {filtered.length === 0 ? (
                <div style={{
                  padding:   'var(--space-12)',
                  textAlign: 'center',
                }}>
                  <p className="text-tertiary" style={{ fontSize: 'var(--text-sm)' }}>
                    No resumes found
                  </p>
                </div>
              ) : (
                filtered.map((r, i) => (
                  <div
                    key={r.id}
                    style={{
                      display:             'grid',
                      gridTemplateColumns: '2fr 1.2fr 80px 80px 100px 80px',
                      padding:             'var(--space-4) var(--space-5)',
                      borderBottom:        i < filtered.length - 1
                        ? '1px solid var(--color-border-surface)'
                        : 'none',
                      alignItems:          'center',
                      transition:          'background var(--transition-fast)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* File */}
                    <div>
                      <div style={{
                        fontSize:  'var(--text-sm)',
                        fontWeight:'var(--weight-medium)',
                        color:     'var(--color-text-primary)',
                        marginBottom: 2,
                        overflow:     'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace:   'nowrap',
                        maxWidth:     200,
                      }}>
                        {r.filename}
                      </div>
                      <span className="badge badge-purple" style={{ fontSize: 10 }}>
                        {r.source === 'linkedin' ? 'LinkedIn' : 'Upload'}
                      </span>
                    </div>

                    {/* Role */}
                    <span style={{
                      fontSize:     'var(--text-xs)',
                      color:        'var(--color-text-secondary)',
                      overflow:     'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace:   'nowrap',
                    }}>
                      {r.role}
                    </span>

                    {/* ATS score */}
                    <div style={{
                      display:        'inline-flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      width:           42,
                      height:          42,
                      borderRadius:   '50%',
                      background:     scoreBg(r.atsScore),
                      fontFamily:     'var(--font-display)',
                      fontSize:       'var(--text-sm)',
                      fontWeight:     'var(--weight-bold)',
                      color:          scoreColor(r.atsScore),
                    }}>
                      {r.atsScore}
                    </div>

                    {/* JD match */}
                    <div>
                      <div style={{
                        fontSize:     'var(--text-sm)',
                        fontWeight:   'var(--weight-medium)',
                        color:        scoreColor(r.jdMatch),
                        marginBottom: 4,
                      }}>
                        {r.jdMatch}%
                      </div>
                      <div className="progress-track" style={{ height: 4 }}>
                        <div
                          className={`progress-fill ${
                            r.jdMatch >= 75 ? 'success' :
                            r.jdMatch >= 50 ? 'warning' : ''
                          }`}
                          style={{ width: `${r.jdMatch}%` }}
                        />
                      </div>
                    </div>

                    {/* Date */}
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      color:    'var(--color-text-tertiary)',
                    }}>
                      {timeAgo(r.createdAt)}
                    </span>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{
                          padding:     '4px 10px',
                          fontSize:    10,
                          color:       'var(--color-primary)',
                          borderColor: 'var(--color-primary-muted)',
                        }}
                        onClick={() => navigate('/ats', { state: { selectedResume: r } })}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{
                          padding:     '4px 10px',
                          fontSize:    10,
                          color:       'var(--color-danger)',
                          borderColor: 'var(--color-danger-bg)',
                        }}
                        onClick={() => handleDelete(r.id)}
                      >
                        Del
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Analyze new resume CTA */}
          <button
            className="btn btn-primary"
            onClick={() => navigate('/ats')}
          >
            Analyze new resume
          </button>
        </div>

        {/* ══ RIGHT COLUMN — profile panel ══ */}
        <div style={{
          position: 'sticky',
          top:      'calc(var(--navbar-height) + var(--space-6))',
          display:  'flex',
          flexDirection: 'column',
          gap:      'var(--space-4)',
        }}>

          {/* Avatar + name */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{
              width:          64,
              height:         64,
              borderRadius:   '50%',
              background:     'var(--color-primary-subtle)',
              border:         '2px solid var(--color-primary-muted)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontFamily:     'var(--font-display)',
              fontSize:       'var(--text-lg)',
              fontWeight:     'var(--weight-bold)',
              color:          'var(--color-primary)',
              margin:         '0 auto var(--space-3)',
            }}>
              {initials}
            </div>

            <p style={{
              fontFamily:   'var(--font-display)',
              fontSize:     'var(--text-md)',
              fontWeight:   'var(--weight-bold)',
              color:        'var(--color-text-primary)',
              marginBottom: 'var(--space-1)',
            }}>
              {name}
            </p>
            <p className="text-secondary" style={{ fontSize: 'var(--text-xs)' }}>
              {user?.email || 'user@email.com'}
            </p>
            <p className="text-tertiary" style={{ fontSize: 'var(--text-xs)', marginTop: 2 }}>
              Member since Jan 2025
            </p>
          </div>

          {/* Profile details */}
          <div className="card">
            <p style={{
              fontSize:      'var(--text-xs)',
              fontWeight:    'var(--weight-medium)',
              color:         'var(--color-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom:  'var(--space-4)',
            }}>
              Profile details
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { label: 'Target role',  value: bestEntry?.role || 'Not set' },
                { label: 'Resumes',      value: `${history.length} analyzed`  },
                { label: 'Best score',   value: bestScore                      },
                { label: 'Avg JD match', value: `${avgJd}%`                   },
                { label: 'Total Logins', value: user?.loginCount || 1         },
                { label: 'Last Login',   value: user?.lastLogin ? timeAgo(user.lastLogin) : 'Just now' },
              ].map(item => (
                <div
                  key={item.label}
                  style={{
                    display:        'flex',
                    justifyContent: 'space-between',
                    alignItems:     'center',
                    fontSize:       'var(--text-xs)',
                  }}
                >
                  <span className="text-secondary">{item.label}</span>
                  <span style={{
                    fontWeight: 'var(--weight-medium)',
                    color:      'var(--color-text-primary)',
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
           
            
            <button
              className="btn btn-ghost btn-sm"
              style={{
                width:       '100%',
                color:       'var(--color-danger)',
                borderColor: 'var(--color-danger-bg)',
              }}
              onClick={logout}
            >
              Log out
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}