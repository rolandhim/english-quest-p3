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

    if (!regNick.trim()) { setRegError('請輸入小朋友嘅名～'); return }
    if (!regEmail.trim()) { setRegError('請輸入電郵地址～'); return }
    if (regPwd.length < 6) { setRegError('密碼最少要 6 個字元喔～'); return }
    if (regPwd !== regConfirm) { setRegError('兩次密碼唔一樣，檢查下先～'); return }

    setRegLoading(true)
    const ok = await register(regEmail.trim(), regPwd, regNick.trim())
    if (!ok) setRegError(error)
    setRegLoading(false)
  }

  return (
    <div className="home" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
      <header className="home-header">
        <h1 className="home-title">English Quest P3 🏴󠁧󠁢󠁥󠁮󠁧󠁿</h1>
        <p className="home-subtitle">小三英文練習 — 邊玩邊學！</p>
      </header>

      <div className="login-tabs">
        <button
          className={`login-tab ${tab === 'login' ? 'login-tab-active' : ''}`}
          onClick={() => setTab('login')}
        >
          🔑 登入
        </button>
        <button
          className={`login-tab ${tab === 'register' ? 'login-tab-active' : ''}`}
          onClick={() => setTab('register')}
        >
          ✨ 新用戶註冊
        </button>
      </div>

      {tab === 'login' && (
        <form className="login-form slide-up" onSubmit={handleLogin}>
          <div className="login-field">
            <label className="login-label">📧 電郵</label>
            <input
              className="login-input"
              type="email"
              placeholder="你的電郵地址"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="login-field">
            <label className="login-label">🔒 密碼</label>
            <input
              className="login-input"
              type="password"
              placeholder="輸入密碼"
              value={loginPwd}
              onChange={(e) => setLoginPwd(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button className="login-submit" type="submit" disabled={loginLoading}>
            {loginLoading ? '⏳ 登入中...' : '🔑 登入'}
          </button>
        </form>
      )}

      {tab === 'register' && (
        <form className="login-form slide-up" onSubmit={handleRegister}>
          <div className="login-field">
            <label className="login-label">🧒 小朋友嘅名字</label>
            <input
              className="login-input"
              placeholder="例如：小明"
              value={regNick}
              onChange={(e) => setRegNick(e.target.value)}
              maxLength={10}
            />
          </div>
          <div className="login-field">
            <label className="login-label">📧 電郵（家長）</label>
            <input
              className="login-input"
              type="email"
              placeholder="家長的電郵地址"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="login-field">
            <label className="login-label">🔒 密碼（最少 6 位）</label>
            <input
              className="login-input"
              type="password"
              placeholder="設定密碼"
              value={regPwd}
              onChange={(e) => setRegPwd(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="login-field">
            <label className="login-label">🔒 確認密碼</label>
            <input
              className="login-input"
              type="password"
              placeholder="再打一次密碼"
              value={regConfirm}
              onChange={(e) => setRegConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {(regError || error) && (
            <div className="login-error">{regError || error}</div>
          )}

          <button className="login-submit" type="submit" disabled={regLoading}>
            {regLoading ? '⏳ 建立中...' : '✨ 建立帳號'}
          </button>
        </form>
      )}
    </div>
  )
}
