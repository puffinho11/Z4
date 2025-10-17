import axios from "axios"

const API_URL = "http://localhost:3000/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const authString = localStorage.getItem("currentUser")

    if (authString) {
      try {
        const authObject = JSON.parse(authString)
        const token = authObject?.token
        if (token) config.headers["x-auth-token"] = token
      } catch {
        config.headers["x-auth-token"] = authString
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `❌ Erro ${error.response.status}:`,
        error.response.data?.msg || error.message
      )
    } else {
      console.error("❌ Erro de conexão com o servidor:", error.message)
    }
    return Promise.reject(error)
  }
)

export default api
