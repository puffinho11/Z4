import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {

    let authString = localStorage.getItem("currentUser")
    let token = null

    if (authString) {
        try {

            const authObject = JSON.parse(authString)
            token = authObject?.token || null
        } catch (e) {

            token = authString
        }
    }

    if (token) {
      config.headers['x-auth-token'] = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default api