import { NavLink } from 'react-router-dom'

export default function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">FP</span>
        <div>
          <strong>Financas</strong>
          <small>Personal finance</small>
        </div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon">🏠</span>
          Dashboard
        </NavLink>
        <NavLink to="/" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon">📘</span>
          Apresentacao
        </NavLink>
        <NavLink to="/categorias" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon">🗂️</span>
          Categorias
        </NavLink>
        <button type="button" className="logout-button" onClick={onLogout}>
          <span className="nav-icon">⎋</span>
          Sair
        </button>
      </nav>
    </aside>
  )
}
