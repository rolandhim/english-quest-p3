import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { flashcards } from '../data/englishData.js'

const DECK_LIST = [
  { id: 'chapter2', icon: '📗', name: 'Chapter 2', desc: 'Past Tense Verbs 過去式動詞', className: 'chapter-card-ch2' },
  { id: 'chapter5', icon: '📘', name: 'Chapter 5', desc: 'Prepositions & Good at 位置介詞', className: 'chapter-card-ch5' },
  { id: 'bonus', icon: '📙', name: 'Bonus', desc: 'Present Continuous 現在進行式', className: 'chapter-card-bonus' },
]

export default function FlashcardsPage() {
  const { chapterId } = useParams()

  // If no chapterId param, show deck selection
  if (!chapterId || !flashcards[chapterId]) {
    return <DeckSelection />
  }

  return <FlashcardViewer chapterId={chapterId} deck={flashcards[chapterId]} />
}

function DeckSelection() {
  return (
    <div className="flashcards-page">
      {/* Header */}
      <div className="chapter-header">
        <Link to="/" className="back-btn">← Back</Link>
        <span style={{ fontSize: 18, fontWeight: 800 }}>🃏 Flashcards 生字卡</span>
        <div />
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-light)', marginTop: 8, marginBottom: 16, textAlign: 'center' }}>
          揀一個章節嚟溫習～
        </div>

        {DECK_LIST.map((deck) => (
          <Link
            key={deck.id}
            to={`/flashcards/${deck.id}`}
            className={`chapter-card ${deck.className}`}
            style={{ textDecoration: 'none', marginBottom: 12 }}
          >
            <div className="chapter-card-header">
              <span className="chapter-icon" style={{ fontSize: 28 }}>{deck.icon}</span>
              <div className="chapter-info">
                <div className="chapter-name">{deck.name}</div>
                <div className="chapter-desc">{deck.desc}</div>
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-light)', marginTop: 8 }}>
              🃏 {flashcards[deck.id]?.cards?.length || 0} cards
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function FlashcardViewer({ chapterId, deck }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const cards = deck.cards
  const totalCards = cards.length
  const currentCard = cards[currentIndex]

  function handleFlip() {
    setFlipped((prev) => !prev)
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setFlipped(false)
    }
  }

  function handleNext() {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1)
      setFlipped(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') handlePrev()
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleFlip()
    }
  }

  return (
    <div className="flashcards-page" tabIndex={0} onKeyDown={handleKeyDown} style={{ outline: 'none' }}>
      {/* Header */}
      <div className="chapter-header">
        <Link to="/flashcards" className="back-btn">← Back</Link>
        <span style={{ fontSize: 16, fontWeight: 800, textAlign: 'center' }}>🃏 {deck.title}</span>
        <div />
      </div>

      {/* Hint */}
      <div className="flashcard-hint" style={{ textAlign: 'center', padding: '4px 16px 12px', fontSize: 14, fontWeight: 600, color: 'var(--text-light)' }}>
        💡 {deck.hint}
      </div>

      {/* Flashcard */}
      <div
        className={`flashcard ${flipped ? 'flipped' : ''}`}
        onClick={handleFlip}
        style={{ cursor: 'pointer' }}
      >
        <div className="flashcard-content">
          {flipped ? currentCard.back : currentCard.front}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)', marginTop: 12 }}>
          {flipped ? '👆 點一下翻轉' : '👆 點一下睇答案'}
        </div>
      </div>

      {/* Navigation */}
      <div className="flashcard-nav">
        <button
          className="flashcard-nav-btn"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          ◀ Prev
        </button>
        <span className="flashcard-counter">
          {currentIndex + 1} / {totalCards}
        </span>
        <button
          className="flashcard-nav-btn"
          onClick={handleNext}
          disabled={currentIndex === totalCards - 1}
        >
          Next ▶
        </button>
      </div>

      {/* Keyboard hint */}
      <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-light)', marginTop: 8 }}>
        ⌨️ ← → 切換卡片 · Space/Enter 翻轉
      </div>

      {/* Progress bar */}
      <div className="quiz-progress-bar" style={{ margin: '16px auto', maxWidth: 300 }}>
        <div
          className="quiz-progress-fill"
          style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
        />
      </div>
    </div>
  )
}
