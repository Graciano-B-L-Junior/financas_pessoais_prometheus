import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, setToken } from '../api/financeApi'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginUser(username, password)
      setToken(data.access)
      onLogin(data.access)
      navigate('/dashboard')
    } catch (err) {
      setError('Falha no login. Verifique usuário e senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-content login-page">
      <section className="card login-card">
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Usuário
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>
          <label>
            Senha
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
