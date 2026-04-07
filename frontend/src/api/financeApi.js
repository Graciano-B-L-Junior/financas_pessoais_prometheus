import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const client = axios.create({
  baseURL: API_BASE,
})

export function setToken(token) {
  if (token) {
    localStorage.setItem('finance_token', token)
    client.defaults.headers.common.Authorization = `Bearer ${token}`
  }
}

export function getToken() {
  const token = localStorage.getItem('finance_token')
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`
  }
  return token
}

export function clearToken() {
  localStorage.removeItem('finance_token')
  delete client.defaults.headers.common.Authorization
}

export async function loginUser(username, password) {
  const response = await client.post('/api/auth/token/', { username, password })
  return response.data
}

export async function registerUser(username, email, password, passwordConfirm) {
  const response = await client.post('/api/auth/register/', {
    username,
    email,
    password,
    password_confirm: passwordConfirm,
  })
  return response.data
}

export async function fetchCategorias() {
  const response = await client.get('/api/categorias/')
  return response.data
}

export async function fetchTransacoes(filters = {}) {
  const params = {}
  if (filters.nome) params.nome = filters.nome
  if (filters.data_min) params.data_min = filters.data_min
  if (filters.data_max) params.data_max = filters.data_max
  if (filters.categoria_id) params.categoria_id = filters.categoria_id
  if (filters.tipo) params.tipo = filters.tipo
  const response = await client.get('/api/transacoes/', { params })
  return response.data
}

export async function uploadXlsx(file, ano) {
  const formData = new FormData()
  formData.append('file', file)
  if (ano) formData.append('ano', ano)
  const response = await client.post('/api/importar/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}
