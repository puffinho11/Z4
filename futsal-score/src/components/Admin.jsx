import React, { useState, useEffect } from "react"

const USERS_KEY = "sfinge_users_v1"
const AUTH_KEY = "sfinge_auth_v1"

export default function Admin() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ username: "", password: "", role: "user" })
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || "[]")
    setUsers(savedUsers)
    const auth = JSON.parse(localStorage.getItem(AUTH_KEY) || "null")
    setCurrentUser(auth)
  }, [])

  function saveUsers(updated) {
    localStorage.setItem(USERS_KEY, JSON.stringify(updated))
    setUsers(updated)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!currentUser || currentUser.role !== "admin") {
      alert("Acesso negado.")
      return
    }

    const { username, password, role } = form
    if (!username || !password) {
      alert("Preencha todos os campos.")
      return
    }

    const updated = [...users]
    const idx = updated.findIndex((u) => u.username === username)

    if (idx >= 0) {
      updated[idx] = { username, password, role }
      alert("Usuário atualizado.")
    } else {
      updated.push({ username, password, role })
      alert("Usuário criado.")
    }

    saveUsers(updated)
    setForm({ username: "", password: "", role: "user" })
  }

  function deleteUser(username) {
    if (!currentUser || currentUser.role !== "admin") {
      alert("Acesso negado.")
      return
    }

    const adminCount = users.filter((u) => u.role === "admin").length
    if (username === "admin" && adminCount === 1) {
      alert("Não foi possí­vel remover o Ultimo admin.")
      return
    }

    const updated = users.filter((u) => u.username !== username)
    saveUsers(updated)
  }

  function clearData() {
    if (
      !window.confirm(
        "Apagar todos os usuários? Esta ação não pode ser desfeita."
      )
    )
      return
    localStorage.removeItem(USERS_KEY)
    setUsers([])
  }

  return (
    <section className="bg-white p-6 rounded-2xl shadow max-w-3xl mx-auto space-y-4 fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Administração — Usuários</h2>
        <button
          onClick={clearData}
          className="text-sm text-red-500 hover:underline"
        >
          Limpar todos os dados
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-3"
      >
        <input
          type="text"
          placeholder="Usuário"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="border rounded-lg px-3 py-2 md:col-span-1"
          required
        />
        <input
          type="text"
          placeholder="Senha"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border rounded-lg px-3 py-2 md:col-span-1"
          required
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="border rounded-lg px-3 py-2 md:col-span-1"
        >
          <option value="user">Usuário</option>
          <option value="admin">Admin</option>
        </select>
        <button className="bg-blue-600 text-white rounded-lg px-3 py-2 md:col-span-1 hover:bg-blue-700">
          Adicionar/Atualizar
        </button>
      </form>

      <div>
        <h3 className="font-semibold mb-2">Lista de Usuários</h3>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Usuários</th>
              <th className="px-3 py-2 text-left">Papel</th>
              <th className="px-3 py-2 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="px-3 py-4 text-center text-gray-500"
                >
                 Nenhum usuário cadastrado.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.username}>
                  <td className="px-3 py-2">{u.username}</td>
                  <td className="px-3 py-2">{u.role}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => deleteUser(u.username)}
                      className="text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
