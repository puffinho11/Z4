import axios from "axios"
import { getToken, clearAuth } from "./utils/authStorage"

export const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn("⚠️ Nenhum token encontrado. Pode ocorrer erro 401.")
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      const msg = data?.message || data?.msg || error.message

      console.error(`❌ Erro ${status}:`, msg)

      if (status === 401 || status === 403) {
        const isExpired =
          msg?.toLowerCase().includes("expired") ||
          msg?.toLowerCase().includes("inválido")

        alert(
          isExpired
            ? "⚠️ Sua sessão expirou. Faça login novamente."
            : "⚠️ Acesso negado. Faça login novamente."
        )

        clearAuth()
        window.location.href = "/login"
      }
    } else if (error.request) {
      alert("Servidor offline. Tente novamente mais tarde.")
      console.error("❌ Nenhuma resposta do servidor.")
    } else {
      console.error("❌ Erro de configuração:", error.message)
    }

    return Promise.reject(error)
  }
)

export default api
