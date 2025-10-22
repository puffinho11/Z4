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
      console.error(`❌ Erro ${status}:`, data?.message || data)

      if (status === 401) {
        console.warn("🔒 Não autorizado - O token pode ter expirado.")
      }
    }
    return Promise.reject(error)
  }
)

export default api













