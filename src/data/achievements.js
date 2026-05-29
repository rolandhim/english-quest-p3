const achievements = [
  // ── Stars ──
  {
    id: 'first_star',
    name: 'English Starter',
    desc: '獲得第一顆星',
    icon: '⭐',
    condition: (stats) => stats.totalStars >= 1,
  },
  {
    id: 'star_25',
    name: '星級學生',
    desc: '累積25顆星',
    icon: '🌟',
    condition: (stats) => stats.totalStars >= 25,
  },
  {
    id: 'star_50',
    name: 'English Star',
    desc: '累積50顆星',
    icon: '💫',
    condition: (stats) => stats.totalStars >= 50,
  },
  {
    id: 'star_100',
    name: 'English Legend',
    desc: '累積100顆星',
    icon: '👑',
    condition: (stats) => stats.totalStars >= 100,
  },

  // ── Chapter Completion ──
  {
    id: 'ch2_master',
    name: 'Past Tense Master',
    desc: '完成 Chapter 2 所有練習',
    icon: '📗',
    condition: (stats) => (stats.progress?.chapter2?.completed?.length || 0) >= 60,
  },
  {
    id: 'ch5_master',
    name: 'Preposition Pro',
    desc: '完成 Chapter 5 所有練習',
    icon: '📘',
    condition: (stats) => (stats.progress?.chapter5?.completed?.length || 0) >= 60,
  },
  {
    id: 'bonus_master',
    name: 'Present Continuous Champ',
    desc: '完成 Bonus 所有練習',
    icon: '📙',
    condition: (stats) => (stats.progress?.bonus?.completed?.length || 0) >= 60,
  },
  {
    id: 'all_chapters',
    name: '完成所有章節',
    desc: '三個章節全部完成',
    icon: '🏆',
    condition: (stats) => {
      const p = stats.progress || {}
      return (
        (p.chapter2?.completed?.length || 0) >= 60 &&
        (p.chapter5?.completed?.length || 0) >= 60 &&
        (p.bonus?.completed?.length || 0) >= 60
      )
    },
  },

  // ── Quiz ──
  {
    id: 'perfect_quiz',
    name: '滿分達人',
    desc: '測驗10題全對',
    icon: '💯',
    condition: (stats) => (stats.quizResults || []).some((r) => r.score === r.total),
  },
  {
    id: 'perfect_3',
    name: '完美三連霸',
    desc: '3次測驗滿分',
    icon: '🏅',
    condition: (stats) => (stats.quizResults || []).filter((r) => r.score === r.total).length >= 3,
  },
  {
    id: 'quiz_5',
    name: '測驗常客',
    desc: '完成5次測驗',
    icon: '📝',
    condition: (stats) => (stats.quizResults || []).length >= 5,
  },
  {
    id: 'quiz_20',
    name: '測驗達人',
    desc: '完成20次測驗',
    icon: '📚',
    condition: (stats) => (stats.quizResults || []).length >= 20,
  },

  // ── Writing ──
  {
    id: 'first_writing',
    name: '小作家',
    desc: '寫第一篇作文',
    icon: '✏️',
    condition: (stats) => (stats.writings || []).length >= 1,
  },
  {
    id: 'writer',
    name: '寫作高手',
    desc: '寫5篇作文',
    icon: '📖',
    condition: (stats) => (stats.writings || []).length >= 5,
  },

  // ── Mixed ──
  {
    id: 'wrong_clear',
    name: '錯題清零',
    desc: '冇任何錯題記錄',
    icon: '🧹',
    condition: (stats) => {
      const w = stats.wrongQuestions || []
      return w.length === 0 && (stats.totalStars || 0) >= 1
    },
  },
  {
    id: 'level_3',
    name: 'English Genius',
    desc: '達到 English Genius 等級',
    icon: '🧠',
    condition: (stats) => {
      const level = stats.level || ''
      return level.includes('Genius') || level.includes('Legend')
    },
  },
]

export default achievements
