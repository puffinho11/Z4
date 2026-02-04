import axios from "axios"
import { getToken, clearAuth } from "./utils/authStorage"

const PROD_URL = "https://z4-r2za.onrender.com"

export const SERVER_URL =
  import.meta.env.VITE_API_URL?.trim() || PROD_URL

console.log("🌐 Conectando ao backend:", SERVER_URL)

const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
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
        alert("⚠️ Sessão expirada. Faça login novamente.")
        clearAuth()
        window.location.href = "/login"
      }
    } else if (error.request) {
      alert("⚠️ Servidor offline. Tente novamente mais tarde.")
    } else {
      console.error("❌ Erro de configuração:", error.message)
    }

    return Promise.reject(error)
  }
)

export const login = (data) => api.post("/auth/login", data)
export const register = (data) => api.post("/auth/register", data)
export const getUserProfile = (id) => api.get(`/users/${id}`)
export const updateUser = (id, data) => api.put(`/users/${id}`, data)
export const deleteUser = (id) => api.delete(`/users/${id}`)

export const getRegistros = () => api.get("/registros")
export const createRegistro = (data) => api.post("/registros", data)
export const updateRegistro = (id, data) => api.put(`/registros/${id}`, data)
export const deleteRegistro = (id) => api.delete(`/registros/${id}`)

export const getExames = () => api.get("/exames")
export const createExame = (data) => api.post("/exames", data)
export const updateExame = (id, data) => api.put(`/exames/${id}`, data)
export const deleteExame = (id) => api.delete(`/exames/${id}`)

export const getEventos = () => api.get("/calendario")
export const createEvento = (data) => api.post("/calendario", data)
export const updateEvento = (id, data) => api.put(`/calendario/${id}`, data)
export const deleteEvento = (id) => api.delete(`/calendario/${id}`)

export const getTimes = () => api.get("/times")
export const createTime = (data) => api.post("/times", data)
export const updateTime = (id, data) => api.put(`/times/${id}`, data)
export const deleteTime = (id) => api.delete(`/times/${id}`)

export const getChamadas = () => api.get("/chamadas")
export const createChamada = (data) => api.post("/chamadas", data)
export const updateChamada = (id, data) => api.put(`/chamadas/${id}`, data)
export const deleteChamada = (id) => api.delete(`/chamadas/${id}`)

export const getUsers = () => api.get("/users")
export const createUser = (data) => api.post("/users", data)
export const updateUserRole = (id, role) => api.put(`/users/${id}/role`, { role })

export default api
