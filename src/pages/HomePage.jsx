import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useProgress } from '../hooks/useProgress.js'
import { rules } from '../data/englishData.js'

const CHAPTERS = [
  {
    id: 'chapter2',
    icon: '📗',
    name: 'Chapter 2',
    desc: 'Simple Past Tense（過去式）',
    className: 'chapter-card-ch2',
    emoji: '📖',
  },
  {
    id: 'chapter5',
    icon: '📘',
    name: 'Chapter 5',
    desc: 'Prepositions & Good at（位置介詞）',
    className: 'chapter-card-ch5',
    emoji: '📍',
  },
  {
    id: 'bonus',
    icon: '📙',
    name: 'Bonus',
    desc: 'Present Continuous（現在進行式）',
    className: 'chapter-card-bonus',
    emoji: '🏃',
  },
]

export default function HomePage() {
  const { userProfile, logout } = useAuth()
  const { getChapterProgress } = useProgress()

  const nickname = userProfile?.nickname || '小朋友'
  const totalStars = userProfile?.totalStars || 0
  const level = userProfile?.level || 'English Star ⭐'

  return (
    <div className="home">
      <div className="home-top-bar">
        <span className="home-greeting">Hello, {nickname}! 👋</span>
        <button className="logout-btn" onClick={logout} title="登出">🚪</button>
      </div>

      <div className="stars-badge float">
        ⭐ {totalStars} 顆星星
      </div>
      <div className="stars-rank">
        {level}
      </div>

      {/* Chapter Selection */}
      <div className="chapters-grid">
        {CHAPTERS.map((ch) => {
          const exercises = rules[ch.id.replace('chapter', '').replace('bonus', 'bonus')]?.exercises
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
          📝 Mixed Quiz 混合練習（10題）
        </Link>

        <Link to="/progress" className="home-btn home-btn-progress">
          📊 Progress 學習進度
        </Link>

        <Link to="/flashcards" className="home-btn home-btn-flashcards">
          🃏 Flashcards 生字卡
        </Link>

        <Link to="/parent-dashboard" className="home-btn home-btn-parent">
          👨‍👩‍👧 Parent 家長模式
        </Link>
      </div>
    </div>
  )
}
