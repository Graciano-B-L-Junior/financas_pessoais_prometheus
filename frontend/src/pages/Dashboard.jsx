import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { fetchCategorias, fetchTransacoes, uploadXlsx, clearToken } from '../api/financeApi'

export default function Dashboard({ onLogout, token }) {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [transacoes, setTransacoes] = useState([])
  const [filters, setFilters] = useState({ nome: '', data_min: '', data_max: '', categoria_id: '' })
  const [uploadMessage, setUploadMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [navigate, token])

  useEffect(() => {
    loadCategorias()
    loadTransacoes(filters)
  }, [])

  const loadCategorias = async () => {
    try {
      const data = await fetchCategorias()
      setCategorias(data)
    } catch (error) {
      console.error(error)
    }
  }

  const loadTransacoes = async (currentFilters) => {
    setLoading(true)
    try {
      const data = await fetchTransacoes(currentFilters)
      setTransacoes(data.results || data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    const nextFilters = { ...filters, [key]: value }
    setFilters(nextFilters)
    loadTransacoes(nextFilters)
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const response = await uploadXlsx(file)
      setUploadMessage(`Importadas ${response.created} transações.`)
      if (response.errors.length) {
        setUploadMessage((prev) => `${prev} ${response.errors.length} erros encontrados.`)
      }
      loadTransacoes(filters)
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

  return (
    <div className="dashboard-shell">
      <Sidebar onLogout={onLogout} />
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Resumo financeiro e controle de transações</p>
          </div>
        </header>

        <section className="cards-row">
          <div className="metric-card">
            <span>Receitas</span>
            <strong>R$ {totalReceitas.toFixed(2)}</strong>
          </div>
          <div className="metric-card">
            <span>Despesas</span>
            <strong>R$ {totalDespesas.toFixed(2)}</strong>
          </div>
          <div className="metric-card">
            <span>Saldo</span>
            <strong>R$ {(totalReceitas - totalDespesas).toFixed(2)}</strong>
          </div>
        </section>

        <section className="filter-panel">
          <h2>Filtros</h2>
          <div className="filter-grid">
            <input placeholder="Nome" value={filters.nome} onChange={(e) => handleFilterChange('nome', e.target.value)} />
            <input type="date" value={filters.data_min} onChange={(e) => handleFilterChange('data_min', e.target.value)} />
            <input type="date" value={filters.data_max} onChange={(e) => handleFilterChange('data_max', e.target.value)} />
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
          <input type="file" accept=".xlsx" onChange={handleUpload} />
          {uploadMessage && <p className="success-text">{uploadMessage}</p>}
        </section>

        <section className="table-panel">
          <h2>Transações</h2>
          {loading ? (
            <p>Carregando transações...</p>
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
                    <td>R$ {Number(transacao.valor).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  )
}
