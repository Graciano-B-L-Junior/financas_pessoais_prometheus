import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { fetchCategorias } from '../api/financeApi'

export default function Categorias({ onLogout, token }) {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
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
    loadCategorias(page)
  }, [])

  const loadCategorias = async (currentPage) => {
    setLoading(true)
    try {
      const data = await fetchCategorias({ page: currentPage, pageSize })
      setCategorias(data.results || data)
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

  const totalPages = useMemo(() => Math.max(1, Math.ceil(pageInfo.count / pageSize)), [pageInfo.count, pageSize])

  const handleNextPage = () => {
    if (!pageInfo.next) return
    const nextPage = page + 1
    setPage(nextPage)
    loadCategorias(nextPage)
  }

  const handlePrevPage = () => {
    if (!pageInfo.prev) return
    const prevPage = Math.max(1, page - 1)
    setPage(prevPage)
    loadCategorias(prevPage)
  }

  return (
    <div className="dashboard-shell">
      <Sidebar onLogout={onLogout} />
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1>Categorias</h1>
            <p>Lista de categorias cadastradas</p>
          </div>
        </header>

        <section className="table-panel">
          <h2>Cadastro de categorias</h2>
          {loading ? (
            <p>Carregando categorias...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((categoria) => (
                  <tr key={categoria.id}>
                    <td>{categoria.nome}</td>
                    <td>{categoria.tipo}</td>
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
      </main>
    </div>
  )
}
