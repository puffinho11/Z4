import React, { useState } from "react"
import { getItem, setItem, USERS_KEY, AUTH_KEY } from "../utils/storage"

export default function LoginModal({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(e) {
    e.preventDefault()
    const users = getItem(USERS_KEY, [])
    const found = users.find(
      (u) => u.username === username && u.password === password
    )
    if (found) {
      setItem(AUTH_KEY, { username: found.username, role: found.role })
      onLogin({ username: found.username, role: found.role })
    } else {
      setError("Usuário ou senha inválidos")
    }
  }

  function createAdminIfNone() {
    const users = getItem(USERS_KEY, [])
    if (!users.length) {
      const admin = { username: "admin", password: "1234", role: "admin" }
      setItem(USERS_KEY, [admin])
      setError("Admin criado: usuário 'admin' senha '1234'. Use para entrar.")
    } else {
      setError("Já existe usuário cadastrado. Peça ao admin para criar.")
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold mb-2">Entrar — Futsal Score</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
            Entrar
          </button>
        </form>

        {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}

        <div className="mt-4 text-sm text-center">
          <p className="text-gray-600 mb-2">
            Se não existir usuário, crie um admin padrão:
          </p>
          <button
            onClick={createAdminIfNone}
            className="text-sm bg-gray-100 px-3 py-2 rounded-lg"
          >
            Criar admin padrão
          </button>
        </div>
      </div>
    </div>
  );
}

