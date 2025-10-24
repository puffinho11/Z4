import React, { useState } from "react"
import { saveUser } from "../utils/authStorage"
import api from "../api"
import LogoFutsalScore from "./logo.png"

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
    <div className="fixed inset-0 flex items-center justify-center bg-emerald-900/70 backdrop-blur-md z-50 px-4">
      <div className="bg-gradient-to-br from-emerald-100 via-white to-emerald-50 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-emerald-200/50 relative">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-700/10"></div>
        <div className="flex justify-center mb-8 relative">
          <img
            src={LogoFutsalScore}
            alt="Futsal Score Logo"
            className="h-28 w-auto drop-shadow-lg hover:scale-105 transition-transform"
          />
        </div>
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center shadow-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5 relative">
          <div>
            <input
              type="text"
              className="w-full border border-emerald-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
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
              className="w-full border border-emerald-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
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
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-900/40 hover:scale-[1.02] transition-all duration-300"
          >
            {loading ? "Conectando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}













