import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useProgress } from '../hooks/useProgress.js'
import { rules } from '../data/englishData.js'
import achievementsData from '../data/achievements.js'

const CHAPTERS = [
  {
    id: 'chapter2',
    icon: '📗',
    name: 'Chapter 2',
    desc: 'Simple Past Tense',
    className: 'chapter-card-ch2',
    emoji: '📖',
  },
  {
    id: 'chapter5',
    icon: '📘',
    name: 'Chapter 5',
    desc: 'Prepositions & Good at',
    className: 'chapter-card-ch5',
    emoji: '📍',
  },
  {
    id: 'bonus',
    icon: '📙',
    name: 'Bonus',
    desc: 'Present Continuous',
    className: 'chapter-card-bonus',
    emoji: '🏃',
  },
]

function BadgesSection({ userProfile }) {
  const stats = useMemo(() => ({
    totalStars: userProfile?.totalStars || 0,
    progress: userProfile?.progress || {},
    quizResults: userProfile?.quizResults || [],
    writings: userProfile?.writings || [],
    wrongQuestions: userProfile?.wrongQuestions || [],
    level: userProfile?.level || '',
  }), [userProfile])

  const unlocked = useMemo(() =>
    achievementsData.filter((a) => a.condition(stats)),
    [stats]
  )

  const locked = useMemo(() =>
    achievementsData.filter((a) => !a.condition(stats)),
    [stats]
  )

  if (unlocked.length === 0 && locked.length === 0) return null

  return (
    <div className="home-badges-section">
      <h3 className="home-badges-title">🏅 My Badges</h3>
      <div className="home-badges-grid">
        {unlocked.map((a) => (
          <div key={a.id} className="badge-item badge-unlocked">
            <span className="badge-icon">{a.icon}</span>
            <div className="badge-info">
              <div className="badge-name">{a.name}</div>
              <div className="badge-desc">{a.desc}</div>
            </div>
          </div>
        ))}
        {locked.map((a) => (
          <div key={a.id} className="badge-item badge-locked">
            <span className="badge-icon badge-icon-locked">{a.icon}</span>
            <div className="badge-info">
              <div className="badge-name badge-name-locked">{a.name}</div>
              <div className="badge-desc badge-desc-locked">{a.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const { userProfile, logout } = useAuth()
  const { getChapterProgress } = useProgress()

  const nickname = userProfile?.nickname || 'Kid'
  const totalStars = userProfile?.totalStars || 0
  const level = userProfile?.level || 'English Star ⭐'

  return (
    <div className="home">
      <div className="home-top-bar">
        <span className="home-greeting">Hello, {nickname}! 👋</span>
        <button className="logout-btn" onClick={logout} title="Logout">🚪</button>
      </div>

      <div className="stars-badge float">
        ⭐ {totalStars} Stars
      </div>
      <div className="stars-rank">
        {level}
      </div>

      <BadgesSection userProfile={userProfile} />

      {/* Chapter Selection */}
      <div className="chapters-grid">
        {CHAPTERS.map((ch) => {
          const exercises = rules[ch.id]?.exercises
          const totalQ = exercises?.length || 0
          const prog = getChapterProgress(ch.id)
          const pct = totalQ > 0 ? Math.min(100, Math.round((prog.completed / totalQ) * 100)) : 0

          return (
            <Link
              key={ch.id}
              to={`/chapter/${ch.id}`}
              className={`chapter-card ${ch.className}`}
            >
              <div className="chapter-card-header">
                <span className="chapter-icon">{ch.icon}</span>
                <div className="chapter-info">
                  <div className="chapter-name">{ch.name}</div>
                  <div className="chapter-desc">{ch.desc}</div>
                </div>
              </div>

              <div className="chapter-progress-wrap">
                <div className="chapter-progress-bg">
                  <div
                    className="chapter-progress-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="chapter-progress-label">
                  ⭐{prog.stars} · {prog.completed}/{totalQ}
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="home-buttons">
        <Link to="/quiz" className="home-btn home-btn-quiz">
          📝 Mixed Quiz (10 Questions)
        </Link>

        <Link to="/progress" className="home-btn home-btn-progress">
          📊 My Progress
        </Link>

        <Link to="/flashcards" className="home-btn home-btn-flashcards">
          🃏 Flashcards
        </Link>

        <Link to="/parent-dashboard" className="home-btn home-btn-parent">
          👨‍👩‍👧 Parent Dashboard
        </Link>
      </div>
    </div>
  )
}
