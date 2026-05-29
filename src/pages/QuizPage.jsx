import { useState } from 'react'
import { Link } from 'react-router-dom'
import { quizQuestions } from '../data/englishData.js'
import { useProgress } from '../hooks/useProgress.js'

const TOTAL_QUESTIONS = 10

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function pickQuestions() {
  const shuffled = shuffleArray(quizQuestions)
  return shuffled.slice(0, TOTAL_QUESTIONS)
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

export default function QuizPage() {
  const { saveQuizResult } = useProgress()

  // Quiz state
  const [questions, setQuestions] = useState(pickQuestions)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedResult, setSavedResult] = useState(null)

  const currentQuestion = questions[currentIndex]
  const MAX_ATTEMPTS = 2

  function resetForNewQuestion() {
    setUserAnswer('')
    setSelectedOption('')
    setShowResult(false)
    setAttempts(0)
    setIsCorrect(false)
  }

  function handleSubmit() {
    if (!currentQuestion || showResult) return

    let correct = false
    if (currentQuestion.type === 'fill') {
      correct = userAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase()
    } else {
      correct = selectedOption === currentQuestion.answer
    }

    setIsCorrect(correct)

    if (correct) {
      setShowResult(true)
      setScore((prev) => prev + 1)
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
  }

  function handleNext() {
    const nextIndex = currentIndex + 1
    if (nextIndex >= TOTAL_QUESTIONS) {
      setFinished(true)
      saveResult(score)
      return
    }

    setCurrentIndex(nextIndex)
    resetForNewQuestion()
  }

  function saveResult(finalScore) {
    setSaving(true)
    saveQuizResult(finalScore, TOTAL_QUESTIONS).then((result) => {
      setSavedResult(result)
    }).finally(() => {
      setSaving(false)
    })
  }

  function handleRetry() {
    setQuestions(pickQuestions())
    setCurrentIndex(0)
    setUserAnswer('')
    setSelectedOption('')
    setShowResult(false)
    setAttempts(0)
    setIsCorrect(false)
    setScore(0)
    setFinished(false)
    setSaving(false)
    setSavedResult(null)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !showResult) {
      handleSubmit()
    }
  }

  // ──── Result Screen ────

  function renderResult() {
    let icon, message, detail
    if (score === TOTAL_QUESTIONS) {
      icon = '🌟'
      message = "Amazing! You're a star! ⭐"
      detail = 'Perfect score! Congratulations! 🎉'
    } else if (score >= 7) {
      icon = '😊'
      message = 'Great job! Keep it up! 😊'
      detail = 'Well done! Keep practising! 💪'
    } else {
      icon = '💪'
      message = "Don't give up! Try again! 💪"
      detail = "You'll do better next time! 🔥"
    }

    return (
      <div className="quiz-result">
        <div className="quiz-result-icon">{icon}</div>
        <div className="quiz-result-score">
          {score} / {TOTAL_QUESTIONS}
        </div>
        <div className="quiz-result-message">{message}</div>
        <div className="quiz-result-detail">{detail}</div>

        {savedResult && (
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginTop: 12 }}>
            ⭐ +{savedResult.starEarned} Stars{savedResult.bonus > 0 ? ` (Perfect bonus +${savedResult.bonus})` : ''}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
          <button className="submit-btn" onClick={handleRetry}>
            🔄 Try Again
          </button>
          <Link to="/" className="submit-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
            🏠 Back to Home
          </Link>
        </div>
      </div>
    )
  }

  // ──── Quiz Question ────

  function renderQuestion() {
    if (!currentQuestion) return null

    const progressPct = Math.round((currentIndex / TOTAL_QUESTIONS) * 100)
    const firstAttemptWrong = attempts > 0 && !showResult

    return (
      <div className="exercise-card">
        {/* Progress */}
        <div className="quiz-progress">
          <div className="quiz-score">
            {currentIndex + 1}/{TOTAL_QUESTIONS} · ⭐ {score}
          </div>
          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="exercise-question">{currentQuestion.question}</div>
        {currentQuestion.hint && (
          <div className="exercise-hint">{currentQuestion.hint}</div>
        )}

        {/* Preposition image */}
        {currentQuestion.image && (
          <div className="question-image-wrapper">
            <img
              className="question-image"
              src={`/images/${currentQuestion.image}.svg`}
              alt={currentQuestion.image.replace('img-', '')}
            />
          </div>
        )}

        {/* First attempt wrong - try again message */}
        {firstAttemptWrong && (
          <div className="feedback-retry">
            {TRY_AGAIN_MESSAGE}
          </div>
        )}

        {/* Input area */}
        {currentQuestion.type === 'fill' ? (
          <input
            className="fill-input"
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={showResult}
            placeholder="Type your answer..."
            autoComplete="off"
          />
        ) : (
          <div className="choice-grid">
            {currentQuestion.options.map((opt, i) => {
              let btnClass = 'choice-btn'
              if (showResult) {
                if (opt === currentQuestion.answer) {
                  btnClass += ' feedback-correct'
                } else if (opt === selectedOption && !isCorrect) {
                  btnClass += ' feedback-wrong'
                }
              } else if (selectedOption === opt) {
                btnClass += ' choice-btn-selected'
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
              (currentQuestion.type === 'fill' && !userAnswer.trim()) ||
              (currentQuestion.type === 'choice' && !selectedOption)
            }
          >
            ✅ Check Answer
          </button>
        ) : (
          <div>
            {isCorrect ? (
              <div className="feedback-correct">
                {getRandomMessage(CORRECT_MESSAGES)}
              </div>
            ) : (
              <div className="feedback-wrong">
                <div style={{ marginTop: 8, fontWeight: 700, color: 'var(--text-light)' }}>
                  The correct answer is: {currentQuestion.answer}
                </div>
              </div>
            )}

            <button className="submit-btn" onClick={handleNext}>
              {currentIndex < TOTAL_QUESTIONS - 1 ? '➡️ Next' : '📊 View Results'}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ──── Main Render ────

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <Link to="/" className="back-btn">← Back</Link>
        <span style={{ fontSize: 18, fontWeight: 800 }}>📝 Mixed Quiz</span>
        <div />
      </div>

      {finished ? renderResult() : renderQuestion()}
    </div>
  )
}
