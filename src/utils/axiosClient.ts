import axios from 'axios'
import { isTokenExpired, getToken, clearToken } from './token'

const client = axios.create({
  baseURL: '',
  withCredentials: true,
  validateStatus: (status) => status >= 200 && status < 300
})

client.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    if (isTokenExpired(token)) {
      clearToken()
      window.location.href = '/login'
      return Promise.reject(new Error('Token expirado'))
    }
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      })
      clearToken()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
