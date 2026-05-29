import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { login, register, error } = useAuth()
  const [tab, setTab] = useState('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPwd, setLoginPwd] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [regNick, setRegNick] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPwd, setRegPwd] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regError, setRegError] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    if (!loginEmail.trim() || !loginPwd) return
    setLoginLoading(true)
    await login(loginEmail.trim(), loginPwd)
    setLoginLoading(false)
  }

  async function handleRegister(e) {
    e.preventDefault()
    setRegError('')

    if (!regNick.trim()) { setRegError("Please enter your child's name"); return }
    if (!regEmail.trim()) { setRegError('Please enter an email'); return }
    if (regPwd.length < 6) { setRegError('Password must be at least 6 characters'); return }
    if (regPwd !== regConfirm) { setRegError('Passwords do not match'); return }

    setRegLoading(true)
    const ok = await register(regEmail.trim(), regPwd, regNick.trim())
    if (!ok) setRegError(error)
    setRegLoading(false)
  }

  return (
    <div className="home" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
      <header className="home-header">
        <h1 className="home-title">English Quest P3 🏴󠁧󠁢󠁥󠁮󠁧󠁿</h1>
        <p className="home-subtitle">P3 English Practice — Learn through play!</p>
      </header>

      <div className="login-tabs">
        <button
          className={`login-tab ${tab === 'login' ? 'login-tab-active' : ''}`}
          onClick={() => setTab('login')}
        >
          🔑 Login
        </button>
        <button
          className={`login-tab ${tab === 'register' ? 'login-tab-active' : ''}`}
          onClick={() => setTab('register')}
        >
          ✨ Register
        </button>
      </div>

      {tab === 'login' && (
        <form className="login-form slide-up" onSubmit={handleLogin}>
          <div className="login-field">
            <label className="login-label">📧 Email</label>
            <input
              className="login-input"
              type="email"
              placeholder="Your email address"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="login-field">
            <label className="login-label">🔒 Password</label>
            <input
              className="login-input"
              type="password"
              placeholder="Enter password"
              value={loginPwd}
              onChange={(e) => setLoginPwd(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button className="login-submit" type="submit" disabled={loginLoading}>
            {loginLoading ? '⏳ Logging in...' : '🔑 Login'}
          </button>
        </form>
      )}

      {tab === 'register' && (
        <form className="login-form slide-up" onSubmit={handleRegister}>
          <div className="login-field">
            <label className="login-label">🧒 Child's Name</label>
            <input
              className="login-input"
              placeholder="e.g. Ming"
              value={regNick}
              onChange={(e) => setRegNick(e.target.value)}
              maxLength={10}
            />
          </div>
          <div className="login-field">
            <label className="login-label">📧 Email (Parent)</label>
            <input
              className="login-input"
              type="email"
              placeholder="Parent's email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="login-field">
            <label className="login-label">🔒 Password (min 6 chars)</label>
            <input
              className="login-input"
              type="password"
              placeholder="Set password"
              value={regPwd}
              onChange={(e) => setRegPwd(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="login-field">
            <label className="login-label">🔒 Confirm Password</label>
            <input
              className="login-input"
              type="password"
              placeholder="Confirm password"
              value={regConfirm}
              onChange={(e) => setRegConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {(regError || error) && (
            <div className="login-error">{regError || error}</div>
          )}

          <button className="login-submit" type="submit" disabled={regLoading}>
            {regLoading ? '⏳ Creating...' : '✨ Create Account'}
          </button>
        </form>
      )}
    </div>
  )
}
