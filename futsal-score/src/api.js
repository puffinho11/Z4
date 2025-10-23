import axios from "axios"
import { getToken } from "./utils/authStorage" 

export const SERVER_URL = "http://localhost:3000" 

const api = axios.create({
  baseURL: `${SERVER_URL}/api`, 
  timeout: 10000, 
  headers: {
    "Content-Type": "application/json", 
  },
})

api.interceptors.request.use(
  (config) => {
    const token = getToken()

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"]
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json"
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn("⚠️ Nenhum token encontrado. A requisição pode falhar com 401.")
    }

    return config
  },
  (error) => {
    console.error("❌ Erro na configuração da requisição:", error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      const msg = data?.message || data?.msg || error.message
      console.error(`❌ Erro ${status}:`, msg)

      if (status === 401 || status === 403) {
        const isExpired = msg?.toLowerCase().includes("expired") || msg?.toLowerCase().includes("inválido")

        if (isExpired) {
          alert("⚠️ Sua sessão expirou. Faça login novamente.")
        } else {
          alert("⚠️ Acesso negado. Faça login novamente.")
        }

        localStorage.removeItem("currentUser")
        localStorage.removeItem("token")

        window.location.href = "/login"
      }

    } else if (error.request) {
      console.error("❌ Sem resposta do servidor. Verifique se o backend está rodando.")
      alert("Servidor offline. Tente novamente em alguns minutos.")
    } else {
      console.error("❌ Erro ao configurar a requisição:", error.message)
    }

    return Promise.reject(error)
  }
)

export default api
