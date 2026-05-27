import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { rules } from '../data/englishData.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useProgress } from '../hooks/useProgress.js'

const WRITING_CONFIG = {
  chapter2: {
    title: '✏️ Diary Entry 日記',
    type: 'diary',
    prompts: [
      'Yesterday, I ___.',
      'I was ___ so I ___.',
      'First, I ___. Then, I ___.',
    ],
  },
  chapter5: {
    title: '👫 My Best Friend 我嘅好朋友',
    type: 'friend',
    prompts: [
      'My best friend is ___.',
      'He / She sits ___ me.',
      'He / She is good at ___.',
    ],
  },
  bonus: {
    title: '🖼️ Picture Description 圖片描述',
    type: 'description',
    prompts: [
      'The boy is ___.',
      'The girls are ___.',
      'I think they are ___.',
    ],
  },
}

const CORRECT_MESSAGES = [
  '🌟 啱晒！Great job!',
  '✅ 好嘢！You got it!',
  '🎉 正確！Well done!',
  '💪 叻仔叻女！Excellent!',
  '⭐ 答對啦！Keep it up!',
]

const WRONG_MESSAGES = [
  '🤔 差少少，再試試！',
  '💪 加油！唔好放棄！',
  '📖 睇下上面嘅 rules 先～',
]

function getRandomMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)]
}

export default function ChapterPage() {
  const { chapterId } = useParams()
  const { userProfile } = useAuth()
  const { saveProgress, getChapterProgress } = useProgress()

  const EXERCISES_PER_SESSION = 15

  const chapter = rules[chapterId]
  const allExercises = chapter?.exercises || []
  const writingConfig = WRITING_CONFIG[chapterId]

  // Shuffle and pick random subset on mount
  const exercises = useState(() => {
    const shuffled = [...allExercises].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(EXERCISES_PER_SESSION, shuffled.length))
  })[0]

  // Tab state
  const [activeTab, setActiveTab] = useState('exercises')

  // Exercise state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [completedSet, setCompletedSet] = useState(new Set())
  const [saving, setSaving] = useState(false)

  // Writing state
  const [writingContent, setWritingContent] = useState('')
  const [writingSaved, setWritingSaved] = useState(false)
  const [savingWriting, setSavingWriting] = useState(false)

  const currentExercise = exercises[currentIndex]

  // Reset exercise state when switching exercises
  function resetExercise() {
    setUserAnswer('')
    setSelectedOption('')
    setSubmitted(false)
    setIsCorrect(false)
  }

  function handleSubmit() {
    if (!currentExercise || submitted) return

    let correct = false
    if (currentExercise.type === 'fill') {
      correct = userAnswer.trim().toLowerCase() === currentExercise.answer.toLowerCase()
    } else {
      correct = selectedOption === currentExercise.answer
    }

    setIsCorrect(correct)
    setSubmitted(true)

    // Save progress
    setSaving(true)
    saveProgress(chapterId, currentExercise.id, correct).finally(() => {
      setSaving(false)
    })

    if (!completedSet.has(currentExercise.id)) {
      setCompletedSet(new Set([...completedSet, currentExercise.id]))
    }
  }

  function handleNext() {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1)
      resetExercise()
    }
  }

  function handleWritingSave() {
    if (!writingContent.trim() || savingWriting) return

    setSavingWriting(true)
    saveWriting(chapterId, writingContent, writingConfig.type).then((res) => {
      if (res?.success) {
        setWritingSaved(true)
        setTimeout(() => setWritingSaved(false), 3000)
      }
    }).finally(() => {
      setSavingWriting(false)
    })
  }

  // Handle Enter key for fill inputs
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !submitted) {
      handleSubmit()
    }
  }

  // ──── Render helpers ────

  function renderRules() {
    if (!chapter) return null

    return (
      <div className="rule-card slide-up">
        <div className="rule-title">{chapter.title}</div>
        <div className="rule-hint">{chapter.hint}</div>
        {chapter.sections.map((section, i) => (
          <div className="rule-section" key={i}>
            <div className="rule-section-title">{section.title}</div>
            <div className="rule-section-hint">{section.hint}</div>
            <div className="rule-content">
              {section.content.map((line, j) => (
                <div key={j}>{line}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  function renderExercise() {
    if (!currentExercise) {
      return (
        <div className="exercise-card" style={{ textAlign: 'center', padding: 30 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div className="exercise-question">All exercises completed!</div>
          <div style={{ fontSize: 14, color: 'var(--text-light)', fontWeight: 600, marginTop: 8 }}>
            全部做晒啦！你好叻！👏
          </div>
        </div>
      )
    }

    const totalExercises = exercises.length
    const completedCount = completedSet.size
    const progressPct = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0

    return (
      <div className="exercise-card slide-up">
        {/* Progress */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)' }}>
              {currentIndex + 1}/{totalExercises}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)' }}>
              ⭐ {completedCount}/{totalExercises}
            </span>
          </div>
          <div className="quiz-progress-bar" style={{ marginBottom: 0 }}>
            <div className="quiz-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="exercise-question">{currentExercise.question}</div>
        <div className="exercise-hint">{currentExercise.hint}</div>

        {/* Input area */}
        {currentExercise.type === 'fill' ? (
          <div>
            <input
              className={`fill-input ${submitted ? (isCorrect ? 'fill-input-correct' : 'fill-input-wrong') : ''}`}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={submitted}
              placeholder="輸入答案..."
              autoComplete="off"
            />
          </div>
        ) : (
          <div className="choice-grid">
            {currentExercise.options.map((opt, i) => {
              let btnClass = 'choice-btn'
              if (!submitted && selectedOption === opt) {
                btnClass += ' choice-btn-selected'
              } else if (submitted) {
                if (opt === currentExercise.answer) {
                  btnClass += ' choice-btn-correct'
                } else if (opt === selectedOption && !isCorrect) {
                  btnClass += ' choice-btn-wrong'
                }
              }
              return (
                <button
                  key={i}
                  className={btnClass}
                  onClick={() => !submitted && setSelectedOption(opt)}
                  disabled={submitted}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {/* Submit / Feedback */}
        {!submitted ? (
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={
              (currentExercise.type === 'fill' && !userAnswer.trim()) ||
              (currentExercise.type === 'choice' && !selectedOption) ||
              saving
            }
          >
            {saving ? '⏳ 儲存中...' : '✅ 檢查答案'}
          </button>
        ) : (
          <div>
            {isCorrect ? (
              <div className="feedback-correct">
                {getRandomMessage(CORRECT_MESSAGES)}
              </div>
            ) : (
              <div className="feedback-wrong">
                {getRandomMessage(WRONG_MESSAGES)}
                <div className="feedback-explain">
                  答案係：{currentExercise.answer}
                </div>
              </div>
            )}

            {currentIndex < exercises.length - 1 && (
              <button className="submit-btn" onClick={handleNext}>
                ➡️ 下一題
              </button>
            )}

            {currentIndex === exercises.length - 1 && (
              <Link to="/" className="submit-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                🏠 返去主頁
              </Link>
            )}
          </div>
        )}
      </div>
    )
  }

  function renderWriting() {
    if (!writingConfig) return null

    const promptText = writingConfig.prompts.map((p, i) => `${i + 1}. ${p}`).join('\n')

    return (
      <div className="writing-section slide-up">
        <div className="writing-title">{writingConfig.title}</div>
        <div className="writing-prompt">
          用下面嘅句子開頭，完成你嘅文章：<br />
          {writingConfig.prompts.map((p, i) => (
            <span key={i} style={{ display: 'block', marginTop: i > 0 ? 4 : 8 }}>
              {i + 1}. {p}
            </span>
          ))}
        </div>
        <textarea
          className="writing-textarea"
          value={writingContent}
          onChange={(e) => setWritingContent(e.target.value)}
          placeholder="喺度寫你嘅文章..."
        />
        <button
          className="writing-save-btn"
          onClick={handleWritingSave}
          disabled={!writingContent.trim() || savingWriting}
        >
          {savingWriting ? '⏳ 儲存中...' : '💾 儲存'}
        </button>
        {writingSaved && (
          <div className="writing-saved">Saved! ✅ 儲存成功！</div>
        )}
      </div>
    )
  }

  // ──── Main render ────

  if (!chapter) {
    return (
      <div className="chapter-page">
        <div className="chapter-header">
          <Link to="/" className="back-btn">← Back</Link>
        </div>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>😅</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>呢個章節不存在</div>
          <Link to="/" className="submit-btn" style={{ display: 'inline-block', marginTop: 20, padding: '12px 24px', textDecoration: 'none' }}>
            🏠 返去主頁
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="chapter-page">
      {/* Header */}
      <div className="chapter-header">
        <Link to="/" className="back-btn">← Back</Link>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-light)' }}>
            ⭐ {userProfile?.totalStars || 0}
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="chapter-title">{chapter.title}</div>
      <div className="chapter-hint">{chapter.hint}</div>

      {/* Rules */}
      {renderRules()}

      {/* Tabs */}
      <div className="exercise-tabs">
        <button
          className={`exercise-tab ${activeTab === 'exercises' ? 'exercise-tab-active' : ''}`}
          onClick={() => setActiveTab('exercises')}
        >
          📝 Exercises 練習
        </button>
        {writingConfig && (
          <button
            className={`exercise-tab ${activeTab === 'writing' ? 'exercise-tab-active' : ''}`}
            onClick={() => setActiveTab('writing')}
          >
            ✍️ Writing 寫作
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'exercises' ? renderExercise() : renderWriting()}
    </div>
  )
}
