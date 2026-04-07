import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../api/financeApi'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', passwordConfirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.passwordConfirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      await registerUser(form.username, form.email, form.password, form.passwordConfirm)
      navigate('/login')
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.join(' '))
      } else {
        setError(detail || 'Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-content login-page">
      <section className="card login-card">
        <h1>Criar Conta</h1>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Usuário
            <input name="username" value={form.username} onChange={handleChange} required />
          </label>
          <label>
            E-mail
            <input type="email" name="email" value={form.email} onChange={handleChange} />
          </label>
          <label>
            Senha
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>
          <label>
            Confirmar Senha
            <input type="password" name="passwordConfirm" value={form.passwordConfirm} onChange={handleChange} required />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </main>
  )
}
