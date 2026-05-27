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
  '🌟 啱晒！Great job!',
  '✅ 好嘢！You got it!',
  '🎉 正確！Well done!',
  '💪 叻仔叻女！Excellent!',
  '⭐ 答對啦！Keep it up!',
]

const WRONG_MESSAGES = [
  '🤔 差少少，再試試！',
  '💪 加油！唔好放棄！',
  '📖 睇下 hint 先～',
]

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
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedResult, setSavedResult] = useState(null)

  const currentQuestion = questions[currentIndex]

  function resetForNewQuestion() {
    setUserAnswer('')
    setSelectedOption('')
    setSubmitted(false)
    setIsCorrect(false)
  }

  function handleSubmit() {
    if (!currentQuestion || submitted) return

    let correct = false
    if (currentQuestion.type === 'fill') {
      correct = userAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase()
    } else {
      correct = selectedOption === currentQuestion.answer
    }

    setIsCorrect(correct)
    setSubmitted(true)

    if (correct) {
      setScore((prev) => prev + 1)
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
    setSubmitted(false)
    setIsCorrect(false)
    setScore(0)
    setFinished(false)
    setSaving(false)
    setSavedResult(null)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !submitted) {
      handleSubmit()
    }
  }

  // ──── Result Screen ────

  function renderResult() {
    let icon, message, detail
    if (score === TOTAL_QUESTIONS) {
      icon = '🌟'
      message = "Amazing! You're a star! ⭐"
      detail = '滿分！你係英文之星！🎉'
    } else if (score >= 7) {
      icon = '😊'
      message = 'Great job! Keep it up! 😊'
      detail = '做得好！繼續努力！💪'
    } else {
      icon = '💪'
      message = "Don't give up! Try again! 💪"
      detail = '加油！下次一定得！🔥'
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
            ⭐ +{savedResult.starEarned} 星星{savedResult.bonus > 0 ? ` （滿分獎勵 +${savedResult.bonus}）` : ''}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
          <button className="submit-btn" onClick={handleRetry}>
            🔄 再玩一次
          </button>
          <Link to="/" className="submit-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
            🏠 返去主頁
          </Link>
        </div>
      </div>
    )
  }

  // ──── Quiz Question ────

  function renderQuestion() {
    if (!currentQuestion) return null

    const progressPct = Math.round((currentIndex / TOTAL_QUESTIONS) * 100)

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
        <div className="exercise-hint">{currentQuestion.hint}</div>

        {/* Input area */}
        {currentQuestion.type === 'fill' ? (
          <input
            className="fill-input"
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={submitted}
            placeholder="輸入答案..."
            autoComplete="off"
          />
        ) : (
          <div className="choice-grid">
            {currentQuestion.options.map((opt, i) => {
              let btnClass = 'choice-btn'
              if (submitted) {
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
              (currentQuestion.type === 'fill' && !userAnswer.trim()) ||
              (currentQuestion.type === 'choice' && !selectedOption)
            }
          >
            ✅ 檢查答案
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
                <div style={{ marginTop: 8, fontWeight: 700, color: 'var(--text-light)' }}>
                  答案係：{currentQuestion.answer}
                </div>
              </div>
            )}

            <button className="submit-btn" onClick={handleNext}>
              {currentIndex < TOTAL_QUESTIONS - 1 ? '➡️ 下一題' : '📊 睇結果'}
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
