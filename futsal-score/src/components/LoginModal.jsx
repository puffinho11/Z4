import React, { useState } from "react"
import { saveUser } from "../utils/authStorage"
import api from "../api"

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

      onLogin(user); 
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
    <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">Entrar — Futsal Score</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:bg-gray-400 hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Conectando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}








