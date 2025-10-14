import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const authString = localStorage.getItem("sfinge_auth_v1")
    const auth = authString ? JSON.parse(authString) : null
    const token = auth?.token 

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config;
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api