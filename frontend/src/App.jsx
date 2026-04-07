import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { getToken, clearToken } from './api/financeApi'

function App() {
  const navigate = useNavigate()
  const [token, setToken] = useState(getToken())

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token, navigate])

  const handleLogout = () => {
    clearToken()
    setToken(null)
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={setToken} />} />
        <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} token={token} />} />
      </Routes>
    </div>
  )
}

export default App
