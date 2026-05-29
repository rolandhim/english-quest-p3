import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { rules } from '../data/englishData.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useProgress } from '../hooks/useProgress.js'

const WRITING_CONFIG = {
  chapter2: {
    title: '✏️ Diary Entry',
    type: 'diary',
    prompts: [
      'Yesterday, I ___.',
      'I was ___ so I ___.',
      'First, I ___. Then, I ___.',
    ],
  },
  chapter5: {
    title: '👫 My Best Friend',
    type: 'friend',
    prompts: [
      'My best friend is ___.',
      'He / She sits ___ me.',
      'He / She is good at ___.',
    ],
  },
  bonus: {
    title: '🖼️ Picture Description',
    type: 'description',
    prompts: [
      'The boy is ___.',
      'The girls are ___.',
      'I think they are ___.',
    ],
  },
}

const CORRECT_MESSAGES = [
  '🌟 Great job!',
  '✅ You got it!',
  '🎉 Well done!',
  '💪 Excellent!',
  '⭐ Keep it up!',
]

const TRY_AGAIN_MESSAGE = 'Not quite! Look at the hint above and try again! 💪'

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
  const [showResult, setShowResult] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)
  const [completedSet, setCompletedSet] = useState(new Set())
  const [saving, setSaving] = useState(false)

  // Writing state
  const [writingContent, setWritingContent] = useState('')
  const [writingSaved, setWritingSaved] = useState(false)
  const [savingWriting, setSavingWriting] = useState(false)

  const currentExercise = exercises[currentIndex]
  const MAX_ATTEMPTS = 2

  // Reset exercise state when switching exercises
  function resetExercise() {
    setUserAnswer('')
    setSelectedOption('')
    setShowResult(false)
    setAttempts(0)
    setIsCorrect(false)
  }

  function handleSubmit() {
    if (!currentExercise || showResult) return

    let correct = false
    if (currentExercise.type === 'fill') {
      correct = userAnswer.trim().toLowerCase() === currentExercise.answer.toLowerCase()
    } else {
      correct = selectedOption === currentExercise.answer
    }

    setIsCorrect(correct)

    if (correct) {
      setShowResult(true)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= MAX_ATTEMPTS) {
        setShowResult(true)
      } else {
        // Clear input for retry
        setUserAnswer('')
        setSelectedOption('')
      }
    }

    // Save progress only when fully resolved (correct or out of attempts)
    if (correct || attempts + 1 >= MAX_ATTEMPTS) {
      setSaving(true)
      saveProgress(chapterId, currentExercise.id, correct).finally(() => {
        setSaving(false)
      })

      if (!completedSet.has(currentExercise.id)) {
        setCompletedSet(new Set([...completedSet, currentExercise.id]))
      }
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
    if (e.key === 'Enter' && !showResult) {
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
            Great work! Keep practising! 👏
          </div>
        </div>
      )
    }

    const totalExercises = exercises.length
    const completedCount = completedSet.size
    const progressPct = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0
    const firstAttemptWrong = attempts > 0 && !showResult

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

        {/* First attempt wrong - try again message */}
        {firstAttemptWrong && (
          <div className="feedback-retry">
            {TRY_AGAIN_MESSAGE}
          </div>
        )}

        {/* Input area */}
        {currentExercise.type === 'fill' ? (
          <div>
            <input
              className={`fill-input ${showResult ? (isCorrect ? 'fill-input-correct' : 'fill-input-wrong') : ''}`}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={showResult}
              placeholder="Type your answer..."
              autoComplete="off"
            />
          </div>
        ) : (
          <div className="choice-grid">
            {currentExercise.options.map((opt, i) => {
              let btnClass = 'choice-btn'
              if (!showResult && selectedOption === opt) {
                btnClass += ' choice-btn-selected'
              } else if (showResult) {
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
                  onClick={() => !showResult && setSelectedOption(opt)}
                  disabled={showResult}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {/* Submit / Feedback */}
        {!showResult ? (
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={
              (currentExercise.type === 'fill' && !userAnswer.trim()) ||
              (currentExercise.type === 'choice' && !selectedOption) ||
              saving
            }
          >
            {saving ? '⏳ Saving...' : '✅ Check Answer'}
          </button>
        ) : (
          <div>
            {isCorrect ? (
              <div className="feedback-correct">
                {getRandomMessage(CORRECT_MESSAGES)}
              </div>
            ) : (
              <div className="feedback-wrong">
                <div className="feedback-explain">
                  The correct answer is: {currentExercise.answer}
                </div>
              </div>
            )}

            {currentIndex < exercises.length - 1 && (
              <button className="submit-btn" onClick={handleNext}>
                ➡️ Next
              </button>
            )}

            {currentIndex === exercises.length - 1 && (
              <Link to="/" className="submit-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                🏠 Back to Home
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
          Use these sentence starters to complete your writing:<br />
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
          placeholder="Write your composition here..."
        />
        <button
          className="writing-save-btn"
          onClick={handleWritingSave}
          disabled={!writingContent.trim() || savingWriting}
        >
          {savingWriting ? '⏳ Saving...' : '💾 Save'}
        </button>
        {writingSaved && (
          <div className="writing-saved">Saved! ✅</div>
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
          <div style={{ fontSize: 18, fontWeight: 800 }}>This chapter does not exist</div>
          <Link to="/" className="submit-btn" style={{ display: 'inline-block', marginTop: 20, padding: '12px 24px', textDecoration: 'none' }}>
            🏠 Back to Home
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
          📝 Exercises
        </button>
        {writingConfig && (
          <button
            className={`exercise-tab ${activeTab === 'writing' ? 'exercise-tab-active' : ''}`}
            onClick={() => setActiveTab('writing')}
          >
            ✍️ Writing
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'exercises' ? renderExercise() : renderWriting()}
    </div>
  )
}
