// src/api.js - CORRIGIDO (Lógica de leitura de token mais robusta)

import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptador para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    // A chave usada para salvar no LoginModal.jsx
    let authString = localStorage.getItem("currentUser") 
    let token = null

    if (authString) {
        try {
            // Tenta ler como um objeto JSON (formato: { token, user: {...} })
            const authObject = JSON.parse(authString)
            token = authObject?.token || null
        } catch (e) {
            // Se falhar o parse, assume que o valor salvo é o token puro em string
            token = authString
        }
    }

    // O back-end exige o cabeçalho 'x-auth-token'
    if (token) {
      config.headers['x-auth-token'] = token 
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default api