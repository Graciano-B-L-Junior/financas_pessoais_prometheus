import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main className="page-content">
      <section className="hero">
        <h1>Finanças Pessoais</h1>
        <p>Organize despesas e receitas, analise seu fluxo financeiro e aprenda a monitorar a aplicação com Prometheus e Grafana.</p>
        <div className="hero-actions">
          <Link to="/login" className="button">Entrar</Link>
          <Link to="/dashboard" className="button button-secondary">Dashboard</Link>
        </div>
      </section>
      <section className="features">
        <article>
          <h2>Login Seguro</h2>
          <p>Autenticação JWT para acesso ao dashboard.</p>
        </article>
        <article>
          <h2>Gestão Financeira</h2>
          <p>Cadastre categorias, filtre transações por data, categoria e nome.</p>
        </article>
        <article>
          <h2>Importação XLSX</h2>
          <p>Popule suas transações rapidamente usando planilhas Excel.</p>
        </article>
      </section>
    </main>
  )
}
