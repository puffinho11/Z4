import React, { useState } from "react"
import { saveUser } from "../utils/authStorage"
import api from "../api"
import LogoFutsalScore from './logo.png'; 

export default function LoginModal({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await api.post("/auth/login", { username, password })
      const { token, user } = response.data

      saveUser({ token, user })
      onLogin(user)
    } catch (err) {
      console.error("Erro no login:", err.response || err)
      if (err.response?.status === 400 || err.response?.status === 401) {
        setError("Usuário ou senha inválidos. Tente novamente.")
      } else {
        setError("Erro ao conectar ao servidor. Verifique se o backend está rodando.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-100">
        <div className="flex justify-center mb-8"> 
          <img
            src={LogoFutsalScore}
            alt="Futsal Score Logo"
            className="h-32 w-auto" 
          />
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg shadow-md transition-colors duration-200"
          >
            {loading ? "Conectando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}












