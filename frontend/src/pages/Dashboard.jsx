import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { fetchCategorias, fetchResumo, fetchTransacoes, uploadXlsx } from '../api/financeApi'

export default function Dashboard({ onLogout, token }) {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [transacoes, setTransacoes] = useState([])
  const [filters, setFilters] = useState({ nome: '', data_min: '', data_max: '', categoria_id: '' })
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploadAno, setUploadAno] = useState(new Date().getFullYear())
  const [summary, setSummary] = useState(null)
  const [summaryYear] = useState(new Date().getFullYear())
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [pageInfo, setPageInfo] = useState({ count: 0, next: null, prev: null })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [navigate, token])

  useEffect(() => {
    loadCategorias()
    loadTransacoes(filters, 1)
    loadResumo(summaryYear)
  }, [])

  const loadCategorias = async () => {
    try {
      const data = await fetchCategorias({ pageSize: 200 })
      setCategorias(data.results || data)
    } catch (error) {
      console.error(error)
    }
  }

  const loadTransacoes = async (currentFilters, currentPage) => {
    setLoading(true)
    try {
      const data = await fetchTransacoes(currentFilters, currentPage, pageSize)
      setTransacoes(data.results || data)
      if (data.results) {
        setPageInfo({ count: data.count, next: data.next, prev: data.previous })
      } else {
        setPageInfo({ count: data.length || 0, next: null, prev: null })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadResumo = async (year) => {
    try {
      const data = await fetchResumo(year)
      setSummary(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleFilterChange = (key, value) => {
    const nextFilters = { ...filters, [key]: value }
    setFilters(nextFilters)
    setPage(1)
    loadTransacoes(nextFilters, 1)
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const response = await uploadXlsx(file, uploadAno)
      setUploadMessage(`Importadas ${response.created} transações.`)
      if (response.errors?.length) {
        setUploadMessage((prev) => `${prev} ${response.errors.length} erros encontrados.`)
      }
      loadTransacoes(filters, page)
    } catch (error) {
      setUploadMessage('Falha ao importar planilha.')
    }
  }

  const totalReceitas = useMemo(
    () => transacoes.filter((item) => item.tipo === 'receita').reduce((sum, item) => sum + Number(item.valor), 0),
    [transacoes],
  )
  const totalDespesas = useMemo(
    () => transacoes.filter((item) => item.tipo === 'despesa').reduce((sum, item) => sum + Number(item.valor), 0),
    [transacoes],
  )

  const resumoReceitas = summary?.receitas ?? totalReceitas
  const resumoDespesas = summary?.despesas ?? totalDespesas
  const resumoSaldo = summary?.saldo ?? totalReceitas - totalDespesas

  const formatter = useMemo(
    () => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    [],
  )

  const historyItems = useMemo(() => transacoes.slice(0, 6), [transacoes])
  const activityItems = useMemo(() => transacoes.slice(0, 4), [transacoes])
  const totalPages = Math.max(1, Math.ceil(pageInfo.count / pageSize))

  const handleNextPage = () => {
    if (!pageInfo.next) return
    const nextPage = page + 1
    setPage(nextPage)
    loadTransacoes(filters, nextPage)
  }

  const handlePrevPage = () => {
    if (!pageInfo.prev) return
    const prevPage = Math.max(1, page - 1)
    setPage(prevPage)
    loadTransacoes(filters, prevPage)
  }

  const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const monthlyTotals = useMemo(() => {
    if (summary?.monthly_totals?.length === 12) {
      const maxValue = Math.max(...summary.monthly_totals, 1)
      return { totals: summary.monthly_totals, maxValue }
    }
    const totals = Array(12).fill(0)
    transacoes.forEach((item) => {
      if (!item.data) return
      const date = new Date(item.data)
      if (Number.isNaN(date.getTime())) return
      totals[date.getMonth()] += Number(item.valor)
    })
    const maxValue = Math.max(...totals, 1)
    return { totals, maxValue }
  }, [summary, transacoes])

  return (
    <div className="dashboard-shell">
      <Sidebar onLogout={onLogout} />
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Resumo financeiro e controle de transacoes</p>
          </div>
          <div className="header-actions">
            <label className="search-box">
              <span className="icon">🔍</span>
              <input placeholder="Buscar transacao" />
            </label>
            <button type="button" className="icon-button" aria-label="Calendario">
              📅
            </button>
            <button type="button" className="icon-button" aria-label="Notificacoes">
              🔔
            </button>
            <div className="avatar">FP</div>
          </div>
        </header>

        <div className="dashboard-grid">
          <section className="dashboard-main">
            <section className="cards-row">
              <div className="metric-card">
                <span>Receitas</span>
                <strong>{formatter.format(resumoReceitas)}</strong>
              </div>
              <div className="metric-card">
                <span>Despesas</span>
                <strong>{formatter.format(resumoDespesas)}</strong>
              </div>
              <div className="metric-card">
                <span>Saldo</span>
                <strong>{formatter.format(resumoSaldo)}</strong>
              </div>
            </section>

            <section className="chart-card">
              <header>
                <div>
                  <h2>Balance</h2>
                  <p>Ultimos 12 meses</p>
                </div>
                <span className="tag">Last 12 months</span>
              </header>
              <div className="chart-bars">
                {monthLabels.map((label, index) => (
                  <div key={label} className="chart-bar">
                    <div
                      className="bar-fill"
                      style={{ height: `${(monthlyTotals.totals[index] / monthlyTotals.maxValue) * 100}%` }}
                    />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="history-card">
              <header>
                <div>
                  <h2>History</h2>
                  <p>Transacoes recentes</p>
                </div>
                <button className="ghost-button" type="button">Ver tudo</button>
              </header>
              <div className="history-list">
                {historyItems.map((item) => (
                  <div key={item.id} className="history-row">
                    <div>
                      <strong>{item.nome}</strong>
                      <span>{item.categoria?.nome || 'Sem categoria'}</span>
                    </div>
                    <span>{item.data}</span>
                    <span>{formatter.format(item.valor)}</span>
                    <span className="status-chip">{item.tipo}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="filter-panel">
              <h2>Filtros</h2>
              <div className="filter-grid">
                <input
                  placeholder="Nome"
                  value={filters.nome}
                  onChange={(e) => handleFilterChange('nome', e.target.value)}
                />
                <input
                  type="date"
                  value={filters.data_min}
                  onChange={(e) => handleFilterChange('data_min', e.target.value)}
                />
                <input
                  type="date"
                  value={filters.data_max}
                  onChange={(e) => handleFilterChange('data_max', e.target.value)}
                />
                <select value={filters.categoria_id} onChange={(e) => handleFilterChange('categoria_id', e.target.value)}>
                  <option value="">Todas as categorias</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                  ))}
                </select>
              </div>
            </section>

            <section className="upload-panel">
              <h2>Importar planilha XLSX</h2>
              <div className="upload-form">
                <label>
                  Ano da planilha
                  <input
                    type="number"
                    value={uploadAno}
                    onChange={(e) => setUploadAno(e.target.value)}
                    min="2000"
                    max="2100"
                  />
                </label>
                <label>
                  Arquivo XLSX
                  <input type="file" accept=".xlsx" onChange={handleUpload} />
                </label>
              </div>
              {uploadMessage && <p className="success-text">{uploadMessage}</p>}
            </section>

            <section className="table-panel">
              <h2>Transacoes</h2>
              {loading ? (
                <p>Carregando transacoes...</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Tipo</th>
                      <th>Categoria</th>
                      <th>Data</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacoes.map((transacao) => (
                      <tr key={transacao.id}>
                        <td>{transacao.nome}</td>
                        <td>{transacao.tipo}</td>
                        <td>{transacao.categoria?.nome}</td>
                        <td>{transacao.data}</td>
                        <td>{formatter.format(transacao.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="table-footer">
                <span>
                  Pagina {page} de {totalPages}
                </span>
                <div className="pager">
                  <button type="button" onClick={handlePrevPage} disabled={!pageInfo.prev}>
                    Anterior
                  </button>
                  <button type="button" onClick={handleNextPage} disabled={!pageInfo.next}>
                    Proxima
                  </button>
                </div>
              </div>
            </section>
          </section>

          <aside className="dashboard-side">
            <section className="activity-card">
              <h2>Recent Activities</h2>
              <div className="activity-list">
                {activityItems.map((item) => (
                  <div key={item.id} className="activity-row">
                    <div className="activity-icon">💳</div>
                    <div>
                      <strong>{item.nome}</strong>
                      <span>{item.categoria?.nome || 'Sem categoria'}</span>
                    </div>
                    <span className="activity-value">{formatter.format(item.valor)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="upcoming-card">
              <h2>Upcoming payments</h2>
              <div className="upcoming-list">
                <div className="upcoming-row">
                  <div className="activity-icon">🏠</div>
                  <div>
                    <strong>Aluguel</strong>
                    <span>Previsto</span>
                  </div>
                  <span className="activity-value">{formatter.format(totalDespesas * 0.25)}</span>
                </div>
                <div className="upcoming-row">
                  <div className="activity-icon">🚗</div>
                  <div>
                    <strong>Seguro</strong>
                    <span>Previsto</span>
                  </div>
                  <span className="activity-value">{formatter.format(totalDespesas * 0.1)}</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}
