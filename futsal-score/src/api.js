import axios from "axios"
import { getCurrentUser } from "./utils/authStorage"

const api = axios.create({
  baseURL: "http://localhost:3000/api",
})

api.interceptors.request.use(
  (config) => {
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.token) {
      config.headers.Authorization = `Bearer ${currentUser.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default api





