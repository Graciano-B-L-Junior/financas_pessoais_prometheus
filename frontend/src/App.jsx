import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import { getToken, clearToken } from './api/financeApi'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [token, setToken] = useState(getToken())

  const publicRoutes = ['/login', '/register']

  useEffect(() => {
    if (!token && !publicRoutes.includes(location.pathname)) {
      navigate('/login')
    }
  }, [token, navigate, location.pathname])

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
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} token={token} />} />
      </Routes>
    </div>
  )
}

export default App
