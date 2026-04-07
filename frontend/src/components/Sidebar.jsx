export default function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand">Finanças</div>
      <nav>
        <a href="/dashboard">Dashboard</a>
        <a href="/">Apresentação</a>
        <button type="button" className="logout-button" onClick={onLogout}>Sair</button>
      </nav>
    </aside>
  )
}
