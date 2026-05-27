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
          <span style={{ fontSize: 18, fontWeight: 800 }}>👨‍👩‍👧 Parent 家長模式</span>
          <div />
        </div>

        <div style={{ padding: '20px 16px' }}>
          <div className="parent-card" style={{ maxWidth: 340, margin: '0 auto', textAlign: 'center' }}>
            <div className="parent-card-title">🔒 輸入 PIN 碼</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-light)', marginBottom: 20 }}>
              請輸入 PIN 碼以查看家長模式
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
                placeholder="輸入 4 位 PIN 碼"
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
                  ❌ PIN 碼錯誤，請再試一次
                </div>
              )}

              <button
                type="submit"
                className="submit-btn"
                style={{ marginTop: 16, width: '100%', maxWidth: 200 }}
                disabled={pin.length !== 4}
              >
                🔓 解鎖
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
  const nickname = userProfile?.nickname || '小朋友'
  const quizResults = userProfile?.quizResults || []
  const writings = userProfile?.writings || []

  return (
    <div className="parent-dashboard">
      {/* Header */}
      <div className="chapter-header">
        <Link to="/" className="back-btn">← Back</Link>
        <span style={{ fontSize: 18, fontWeight: 800 }}>👨‍👩‍👧 家長模式</span>
        <div />
      </div>

      {/* Child Info */}
      <div className="parent-card">
        <div className="parent-card-title">👤 {nickname} 嘅學習概覽</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
          <div className="progress-stat-card" style={{ flex: '1 1 100px' }}>
            <div className="progress-stat-icon">⭐</div>
            <div className="progress-stat-value">{totalStars}</div>
            <div className="progress-stat-label">總星星</div>
          </div>
          <div className="progress-stat-card" style={{ flex: '1 1 100px' }}>
            <div className="progress-stat-icon">👑</div>
            <div className="progress-stat-value" style={{ fontSize: 14 }}>{level}</div>
            <div className="progress-stat-label">等級</div>
          </div>
          <div className="progress-stat-card" style={{ flex: '1 1 100px' }}>
            <div className="progress-stat-icon">📝</div>
            <div className="progress-stat-value">{quizResults.length}</div>
            <div className="progress-stat-label">測驗</div>
          </div>
          <div className="progress-stat-card" style={{ flex: '1 1 100px' }}>
            <div className="progress-stat-icon">✏️</div>
            <div className="progress-stat-value">{writings.length}</div>
            <div className="progress-stat-label">作文</div>
          </div>
        </div>
      </div>

      {/* Progress Per Chapter */}
      <div className="parent-card">
        <div className="parent-card-title">📖 章節進度</div>
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
                  {prog.completed}/{totalQ} 題
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quiz Results History */}
      <div className="parent-card">
        <div className="parent-card-title">📋 測驗記錄</div>
        {quizResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-light)', fontWeight: 600 }}>
            未有測驗記錄
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
                ⭐ 獲得 +{result.starEarned} 星星
                {result.bonus > 0 && (
                  <span style={{ color: 'var(--green-dark)', marginLeft: 6 }}>
                    （滿分獎勵 +{result.bonus}）
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Writings */}
      <div className="parent-card">
        <div className="parent-card-title">✏️ 已儲存嘅作文</div>
        {writings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-light)', fontWeight: 600 }}>
            未有寫作記錄
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
          🏠 返去主頁
        </Link>
      </div>
    </div>
  )
}
