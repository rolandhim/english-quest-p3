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

export default function ProgressPage() {
  const { userProfile, getLevel } = useAuth()
  const { getChapterProgress } = useProgress()

  const totalStars = userProfile?.totalStars || 0
  const level = userProfile?.level || 'English Star ⭐'
  const quizResults = userProfile?.quizResults || []
  const writings = userProfile?.writings || []

  return (
    <div className="progress-page">
      {/* Header */}
      <div className="chapter-header">
        <Link to="/" className="back-btn">← Back</Link>
        <span style={{ fontSize: 18, fontWeight: 800 }}>📊 My Progress</span>
        <div />
      </div>

      {/* Overall Stats Card */}
      <div className="progress-card">
        <div className="progress-card-title">🏆 Overall</div>
        <div className="progress-stat-grid">
          <div className="progress-stat-card">
            <div className="progress-stat-icon">⭐</div>
            <div className="progress-stat-value">{totalStars}</div>
            <div className="progress-stat-label">Total Stars</div>
          </div>
          <div className="progress-stat-card">
            <div className="progress-stat-icon">📝</div>
            <div className="progress-stat-value">{quizResults.length}</div>
            <div className="progress-stat-label">Quizzes Done</div>
          </div>
          <div className="progress-stat-card">
            <div className="progress-stat-icon">👑</div>
            <div className="progress-stat-value">{level}</div>
            <div className="progress-stat-label">Current Level</div>
          </div>
          <div className="progress-stat-card">
            <div className="progress-stat-icon">✏️</div>
            <div className="progress-stat-value">{writings.length}</div>
            <div className="progress-stat-label">Writings Saved</div>
          </div>
        </div>
      </div>

      {/* Progress Per Chapter */}
      <div className="progress-card">
        <div className="progress-card-title">📖 Chapter Progress</div>
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
                  {prog.completed}/{totalQ}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quiz History */}
      <div className="progress-card">
        <div className="progress-card-title">📋 Quiz History</div>
        {quizResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-light)', fontWeight: 600 }}>
            No quiz records yet. Start one from the home page! 🎯
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
                ⭐ +{result.starEarned} stars
                {result.bonus > 0 && (
                  <span style={{ color: 'var(--green-dark)', marginLeft: 6 }}>
                    🎉 Perfect score bonus +{result.bonus}!
                  </span>
                )}
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
