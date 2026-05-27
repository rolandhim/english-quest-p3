import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config.js'

const AuthContext = createContext(null)

const LEVELS = [
  { min: 0, name: 'English Star ⭐' },
  { min: 10, name: 'English Champ 🏆' },
  { min: 25, name: 'English Master 👑' },
  { min: 50, name: 'English Genius 🧠' },
  { min: 100, name: 'English Legend 🚀' },
]

function getLevel(stars) {
  let level = LEVELS[0]
  for (const l of LEVELS) {
    if (stars >= l.min) level = l
  }
  return level.name
}

function getFirebaseErrorMessage(err) {
  switch (err.code) {
    case 'auth/email-already-in-use':
      return '呢個電郵已經註冊過啦！用「登入」試試～'
    case 'auth/invalid-email':
      return '電郵格式唔啱，檢查下先～'
    case 'auth/user-not-found':
      return '冇呢個帳號，試下註冊先～'
    case 'auth/wrong-password':
      return '密碼唔啱，再試一次～'
    case 'auth/weak-password':
      return '密碼太短啦，最少要 6 個字～'
    case 'auth/invalid-credential':
      return '電郵或密碼唔正確～'
    case 'auth/too-many-requests':
      return '嘗試太多次，等一陣再試～'
    default:
      return `出咗問題：${err.message}`
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid))
          if (snap.exists()) {
            setUserProfile(snap.data())
          } else {
            setUserProfile(null)
          }
        } catch {
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function register(email, password, nickname) {
    setError('')
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const uid = cred.user.uid
      await updateProfile(cred.user, { displayName: nickname })

      const profile = {
        nickname,
        email,
        totalStars: 0,
        level: 'English Star ⭐',
        progress: {
          chapter2: { completed: [], stars: 0 },
          chapter5: { completed: [], stars: 0 },
          bonus: { completed: [], stars: 0 },
        },
        quizResults: [],
        writings: [],
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        parentPin: '1234',
      }
      await setDoc(doc(db, 'users', uid), profile)
      setUserProfile(profile)
      return true
    } catch (err) {
      setError(getFirebaseErrorMessage(err))
      return false
    }
  }

  async function login(email, password) {
    setError('')
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const snap = await getDoc(doc(db, 'users', cred.user.uid))
      if (snap.exists()) {
        setUserProfile(snap.data())
      }
      return true
    } catch (err) {
      setError(getFirebaseErrorMessage(err))
      return false
    }
  }

  async function logout() {
    await signOut(auth)
    setUserProfile(null)
    setCurrentUser(null)
  }

  async function refreshProfile() {
    if (!currentUser) return
    const snap = await getDoc(doc(db, 'users', currentUser.uid))
    if (snap.exists()) {
      setUserProfile(snap.data())
    }
  }

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    login,
    register,
    logout,
    refreshProfile,
    getLevel,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
