import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export async function analyze(text) {
  const { data } = await api.post('/api/analyze', { text })
  return data
}

export async function health() {
  const { data } = await api.get('/api/health')
  return data
}

export async function decodeUpi(text) {
  const { data } = await api.post('/api/decode-upi', { text })
  return data
}

export async function checkLink(text) {
  const { data } = await api.post('/api/check-link', { text })
  return data
}

export async function checkPayee(vpa) {
  const { data } = await api.post('/api/check-payee', { vpa })
  return data
}

export async function reportPayee(vpa) {
  const { data } = await api.post('/api/report-payee', { vpa })
  return data
}
