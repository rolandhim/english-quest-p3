import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import HomePage from './pages/HomePage.jsx'
import ChapterPage from './pages/ChapterPage.jsx'
import QuizPage from './pages/QuizPage.jsx'
import ProgressPage from './pages/ProgressPage.jsx'
import FlashcardsPage from './pages/FlashcardsPage.jsx'
import ParentDashboard from './pages/ParentDashboard.jsx'
import LoginPage from './pages/LoginPage.jsx'
import './App.css'

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p style={{ marginTop: 16, fontSize: 18, fontWeight: 700, color: 'var(--text-light)' }}>
        準備中...
      </p>
    </div>
  )
}

function AppRoutes() {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!currentUser) {
    return <LoginPage />
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chapter/:chapterId" element={<ChapterPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/progress" element={<ProgressPage />} />
      <Route path="/flashcards" element={<FlashcardsPage />} />
      <Route path="/flashcards/:chapterId" element={<FlashcardsPage />} />
      <Route path="/parent-dashboard" element={<ParentDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
