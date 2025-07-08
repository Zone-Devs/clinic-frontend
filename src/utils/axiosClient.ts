// src/utils/axiosClient.ts
import axios from 'axios'
import { isTokenExpired } from './token'

const client = axios.create({
  baseURL: '',        // <-- vacío: relativo al host que sirve Next.js
  withCredentials: true,
})

client.interceptors.request.use(config => {
  const match = document.cookie.match(/(?:^|; )token=([^;]+)/)
  console.log('🚬 ===> :12 ===> document.cookie:', document.cookie);
  console.log('🚬 ===> :12 ===> match:', match);
  const token = match?.[1]

  if (token) {
    if (!isTokenExpired(token)) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    } else {
      document.cookie = 'token=; path=/; max-age=0'
      window.location.href = '/login'
      return Promise.reject(new Error('Token expirado'))
    }
  }
  return config
})

export default client
