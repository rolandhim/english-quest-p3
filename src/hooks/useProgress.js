import { useCallback } from 'react'
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuth } from '../context/AuthContext.jsx'

const LEVELS = [
  { min: 0, name: 'English Star ⭐' },
  { min: 10, name: 'English Champ 🏆' },
  { min: 25, name: 'English Master 👑' },
  { min: 50, name: 'English Genius 🧠' },
  { min: 100, name: 'English Legend 🚀' },
]

function calcLevel(stars) {
  let level = LEVELS[0]
  for (const l of LEVELS) {
    if (stars >= l.min) level = l
  }
  return level.name
}

const CHAPTER_MAP = {
  chapter2: 'Chapter 2 — Simple Past',
  chapter5: 'Chapter 5 — Prepositions',
  bonus: 'Bonus — Present Continuous',
}

export function useProgress() {
  const { currentUser, userProfile, refreshProfile } = useAuth()

  const saveProgress = useCallback(async (chapterId, questionId, isCorrect) => {
    if (!currentUser || !userProfile) return { success: false }

    const uid = currentUser.uid
    const userRef = doc(db, 'users', uid)

    const topicProgress = userProfile.progress?.[chapterId] || { completed: [], stars: 0 }
    const alreadyDone = topicProgress.completed.includes(questionId)

    if (alreadyDone) return { success: true, msg: '已經答過呢題啦～' }

    const newCompleted = [...topicProgress.completed, questionId]
    const starEarned = isCorrect ? 1 : 0
    const newTopicStars = topicProgress.stars + starEarned
    const newTotalStars = (userProfile.totalStars || 0) + starEarned
    const newLevel = calcLevel(newTotalStars)

    const updates = {
      [`progress.${chapterId}.completed`]: newCompleted,
      [`progress.${chapterId}.stars`]: newTopicStars,
      totalStars: newTotalStars,
      level: newLevel,
      lastLogin: serverTimestamp(),
    }

    if (!isCorrect) {
      const wrongEntry = { questionId, chapterId, timestamp: new Date().toISOString() }
      updates.wrongQuestions = arrayUnion(wrongEntry)
    }

    await updateDoc(userRef, updates)
    await refreshProfile()

    return { success: true, starEarned, totalStars: newTotalStars, level: newLevel }
  }, [currentUser, userProfile, refreshProfile])

  const saveQuizResult = useCallback(async (score, total) => {
    if (!currentUser) return

    const bonus = score === total ? 3 : 0
    const starEarned = score + bonus
    const uid = currentUser.uid
    const userRef = doc(db, 'users', uid)

    const newTotalStars = (userProfile?.totalStars || 0) + starEarned
    const newLevel = calcLevel(newTotalStars)

    const resultEntry = {
      date: new Date().toISOString(),
      score,
      total,
      bonus,
      starEarned,
    }

    await updateDoc(userRef, {
      totalStars: newTotalStars,
      level: newLevel,
      lastLogin: serverTimestamp(),
      quizResults: arrayUnion(resultEntry),
    })

    await refreshProfile()
    return { starEarned, bonus, totalStars: newTotalStars, level: newLevel }
  }, [currentUser, userProfile, refreshProfile])

  const saveWriting = useCallback(async (chapterId, content, type) => {
    if (!currentUser) return { success: false }

    const uid = currentUser.uid
    const userRef = doc(db, 'users', uid)

    const writingEntry = {
      date: new Date().toISOString(),
      chapterId,
      chapterName: CHAPTER_MAP[chapterId] || chapterId,
      content,
      type,
    }

    await updateDoc(userRef, {
      writings: arrayUnion(writingEntry),
    })

    await refreshProfile()
    return { success: true }
  }, [currentUser, refreshProfile])

  const getChapterProgress = useCallback((chapterId) => {
    if (!userProfile?.progress) {
      return { completed: 0, stars: 0 }
    }
    const cp = userProfile.progress[chapterId]
    if (!cp) return { completed: 0, stars: 0 }
    return {
      completed: cp.completed?.length || 0,
      stars: cp.stars || 0,
    }
  }, [userProfile])

  return { saveProgress, saveQuizResult, saveWriting, getChapterProgress, CHAPTER_MAP }
}
