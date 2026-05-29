import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useProgress } from '../hooks/useProgress.js'
import { rules } from '../data/englishData.js'

const CHAPTER_INFO = [
  { id: 'chapter2', icon: '📗', name: 'Chapter 2 — Simple Past' },
  { id: 'chapter5', icon: '📘', name: 'Chapter 5 — Prepositions' },
  { id: 'bonus', icon: '📙', name: 'Bonus — Present Continuous' },
]

function formatDate(isoString) {
  const d = new Date(isoString)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

export default function ParentDashboard() {
  const { userProfile, getLevel } = useAuth()
  const { getChapterProgress } = useProgress()

  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  const correctPin = userProfile?.parentPin || '1234'

  function handlePinSubmit(e) {
    e.preventDefault()
    if (pin === correctPin) {
      setUnlocked(true)
      setPinError(false)
    } else {
      setPinError(true)
      setPin('')
    }
  }

  // ──── PIN Screen ────

  if (!unlocked) {
    return (
      <div className="parent-dashboard">
        <div className="chapter-header">
          <Link to="/" className="back-btn">← Back</Link>
          <span style={{ fontSize: 18, fontWeight: 800 }}>👨‍👩‍👧 Parent Dashboard</span>
          <div />
        </div>

        <div style={{ padding: '20px 16px' }}>
          <div className="parent-card" style={{ maxWidth: 340, margin: '0 auto', textAlign: 'center' }}>
            <div className="parent-card-title">🔒 Enter PIN</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-light)', marginBottom: 20 }}>
              Enter PIN to access Parent Dashboard
            </div>

            <form onSubmit={handlePinSubmit}>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''))
                  setPinError(false)
                }}
                placeholder="Enter 4-digit PIN"
                style={{
                  width: '100%',
                  maxWidth: 200,
                  padding: '14px 16px',
                  fontSize: 24,
                  fontWeight: 800,
                  textAlign: 'center',
                  letterSpacing: 8,
                  border: `2px solid ${pinError ? 'var(--red)' : 'var(--border)'}`,
                  borderRadius: 12,
                  outline: 'none',
                  background: 'var(--card-bg)',
                  color: 'var(--text)',
                }}
                autoComplete="off"
                autoFocus
              />

              {pinError && (
                <div style={{ color: 'var(--red)', fontSize: 14, fontWeight: 700, marginTop: 12 }}>
                  ❌ Wrong PIN, please try again
                </div>
              )}

              <button
                type="submit"
                className="submit-btn"
                style={{ marginTop: 16, width: '100%', maxWidth: 200 }}
                disabled={pin.length !== 4}
              >
                🔓 Unlock
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ──── Dashboard ────

  const totalStars = userProfile?.totalStars || 0
  const level = userProfile?.level || 'English Star ⭐'
  const nickname = userProfile?.nickname || 'Kid'
  const quizResults = userProfile?.quizResults || []
  const writings = userProfile?.writings || []

  return (
    <div className="parent-dashboard">
      {/* Header */}
      <div className="chapter-header">
        <Link to="/" className="back-btn">← Back</Link>
        <span style={{ fontSize: 18, fontWeight: 800 }}>👨‍👩‍👧 Parent Dashboard</span>
        <div />
      </div>

      {/* Child Info */}
      <div className="parent-card">
        <div className="parent-card-title">👤 {nickname}'s Learning Overview</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
          <div className="progress-stat-card" style={{ flex: '1 1 100px' }}>
            <div className="progress-stat-icon">⭐</div>
            <div className="progress-stat-value">{totalStars}</div>
            <div className="progress-stat-label">Total Stars</div>
          </div>
          <div className="progress-stat-card" style={{ flex: '1 1 100px' }}>
            <div className="progress-stat-icon">👑</div>
            <div className="progress-stat-value" style={{ fontSize: 14 }}>{level}</div>
            <div className="progress-stat-label">Level</div>
          </div>
          <div className="progress-stat-card" style={{ flex: '1 1 100px' }}>
            <div className="progress-stat-icon">📝</div>
            <div className="progress-stat-value">{quizResults.length}</div>
            <div className="progress-stat-label">Quizzes</div>
          </div>
          <div className="progress-stat-card" style={{ flex: '1 1 100px' }}>
            <div className="progress-stat-icon">✏️</div>
            <div className="progress-stat-value">{writings.length}</div>
            <div className="progress-stat-label">Writings</div>
          </div>
        </div>
      </div>

      {/* Progress Per Chapter */}
      <div className="parent-card">
        <div className="parent-card-title">📖 Chapter Progress</div>
        {CHAPTER_INFO.map((ch) => {
          const exercises = rules[ch.id]?.exercises || []
          const totalQ = exercises.length
          const prog = getChapterProgress(ch.id)
          const pct = totalQ > 0 ? Math.min(100, Math.round((prog.completed / totalQ) * 100)) : 0

          return (
            <div className="progress-chapter-row" key={ch.id}>
              <span className="progress-chapter-icon">{ch.icon}</span>
              <div className="progress-chapter-info">
                <div className="progress-chapter-name">{ch.name}</div>
                <div className="chapter-progress-wrap" style={{ marginTop: 4 }}>
                  <div className="chapter-progress-bg">
                    <div
                      className="chapter-progress-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="progress-chapter-stars">
                ⭐ {prog.stars}<br />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-light)' }}>
                  {prog.completed}/{totalQ} done
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quiz Results History */}
      <div className="parent-card">
        <div className="parent-card-title">📋 Quiz History</div>
        {quizResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-light)', fontWeight: 600 }}>
            No quiz records yet
          </div>
        ) : (
          [...quizResults].reverse().map((result, i) => (
            <div className="quiz-history-item" key={i}>
              <div className="quiz-history-top">
                <span className="quiz-history-score">
                  {result.score}/{result.total}
                </span>
                <span className="quiz-history-date">
                  {formatDate(result.date)}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light)', marginTop: 2 }}>
                ⭐ +{result.starEarned} stars earned
                {result.bonus > 0 && (
                  <span style={{ color: 'var(--green-dark)', marginLeft: 6 }}>
                    (Perfect score bonus +{result.bonus})
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Writings */}
      <div className="parent-card">
        <div className="parent-card-title">✏️ Saved Writings</div>
        {writings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-light)', fontWeight: 600 }}>
            No writings yet
          </div>
        ) : (
          [...writings].reverse().map((writing, i) => (
            <div key={i} style={{
              padding: '10px 14px',
              marginBottom: 8,
              background: 'var(--card-bg)',
              borderRadius: 10,
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)' }}>
                  {writing.chapterName || writing.chapterId}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-light)' }}>
                  {formatDate(writing.date)}
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {writing.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Back to Home */}
      <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 30 }}>
        <Link to="/" className="submit-btn" style={{ display: 'inline-block', padding: '12px 28px', textDecoration: 'none' }}>
          🏠 Back to Home
        </Link>
      </div>
    </div>
  )
}
