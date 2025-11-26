import React, { useState, useEffect } from "react"
import api from "../api"
import { MdAdminPanelSettings, MdEdit, MdDelete, MdPersonAdd } from "react-icons/md"

export default function Admin() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "user",
    time: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editingUsername, setEditingUsername] = useState(null)

  async function fetchUsers() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get("/users")
      setUsers(response.data)
    } catch (err) {
      console.error("Erro ao buscar usuários:", err.response || err)
      const status = err.response?.status
      const msg =
        status === 403 || status === 401
          ? "Acesso negado. Você não é um administrador ou seu token expirou."
          : err.response?.data?.msg ||
            "Erro ao carregar lista de usuários. Verifique o console."
      setError(msg)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  function handleChange(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function editUser(user) {
    setForm({
      username: user.username,
      password: "",
      role: user.role,
      time: user.time || "",
    })
    setEditingUsername(user.username)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const { username, password, role, time } = form

    if (!username || (!password && !editingUsername) || !time) {
      alert(
        "Preencha o nome de usuário, a senha (obrigatória para novos) e o nome do Time."
      )
      return
    }

    setLoading(true)

    try {
      const data = { username, password: password || undefined, role, time }

      if (editingUsername) {
        const response = await api.put(`/users/${editingUsername}`, data)
        alert(response.data.msg)
      } else {
        const response = await api.post("/users/register", data)
        alert(response.data.msg)
      }

      setForm({ username: "", password: "", role: "user", time: "" })
      setEditingUsername(null)
      fetchUsers()
    } catch (err) {
      console.error("Erro no formulário de usuário:", err.response || err)
      setError(
        err.response?.data?.msg ||
          "Erro ao salvar o usuário. Verifique o console."
      )
    } finally {
      setLoading(false)
    }
  }

  async function deleteUser(username) {
    if (!window.confirm(`Tem certeza que deseja remover o usuário ${username}?`))
      return

    setLoading(true)
    setError(null)
    try {
      const response = await api.delete(`/users/${username}`)
      alert(response.data.msg)
      fetchUsers()
    } catch (err) {
      console.error("Erro ao deletar usuário:", err.response || err)
      setError(
        err.response?.data?.msg ||
          "Erro ao deletar usuário. Verifique o console."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="p-4 sm:p-6 lg:p-8 ml-0 lg:ml-64 min-h-screen bg-white">
      <h2 className="text-3xl font-bold mb-8 text-emerald-800 flex items-center gap-2">
        <MdAdminPanelSettings className="text-4xl text-emerald-600" />
        Gestão de Usuários
      </h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 shadow">
          {error}
        </div>
      )}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-100 mb-10">
        <h3 className="text-xl font-semibold mb-4 text-emerald-800 flex items-center gap-2">
          <MdPersonAdd className="text-2xl text-emerald-600" />
          {editingUsername
            ? `Editar Usuário: ${editingUsername}`
            : "Novo Usuário"}
        </h3>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Usuário
            </label>
            <input
              className="w-full border border-emerald-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500"
              placeholder="Nome de Usuário"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              required
              disabled={loading || !!editingUsername}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Nome do Time
            </label>
            <input
              className="w-full border border-emerald-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500"
              placeholder="Ex: Futsal Mania"
              value={form.time}
              onChange={(e) => handleChange("time", e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Papel
            </label>
            <select
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
              className="w-full border border-emerald-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500"
              required
              disabled={loading}
            >
              <option value="user">Usuário</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Senha
            </label>
            <input
              className="w-full border border-emerald-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500"
              placeholder={
                editingUsername ? "Nova senha (opcional)" : "Senha"
              }
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              type="password"
              required={!editingUsername}
              disabled={loading}
            />
          </div>

          <div className="md:col-span-4 flex gap-3 pt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-5 py-2 rounded-lg font-semibold hover:scale-[1.03] transition"
              disabled={loading}
            >
              {loading
                ? "Processando..."
                : editingUsername
                ? "Atualizar Usuário"
                : "Criar Usuário"}
            </button>

            <button
              type="button"
              onClick={() => {
                setForm({ username: "", password: "", role: "user", time: "" })
                setEditingUsername(null)
                setError(null)
              }}
              className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
              disabled={loading}
            >
              Limpar / Cancelar
            </button>
          </div>
        </form>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-100 overflow-x-auto">
        <h3 className="text-xl font-semibold mb-4 text-emerald-800">
          Lista de Usuários ({users.length})
        </h3>

        {loading && users.length === 0 && (
          <p className="text-emerald-600">Carregando usuários...</p>
        )}

        <table className="min-w-full divide-y divide-emerald-100">
          <thead className="bg-emerald-50">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-semibold text-emerald-800 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-emerald-800 uppercase tracking-wider">
                Time
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-emerald-800 uppercase tracking-wider">
                Papel
              </th>
              <th className="px-3 py-2 text-center text-sm font-semibold text-emerald-800 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-emerald-100">
            {users.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-3 py-4 text-center text-gray-500 italic"
                >
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.username}
                  className="hover:bg-emerald-50 transition"
                >
                  <td className="px-3 py-2 text-gray-800">{u.username}</td>
                  <td className="px-3 py-2 text-gray-800">{u.time}</td>
                  <td className="px-3 py-2 text-gray-800 capitalize">
                    {u.role}
                  </td>
                  <td className="px-3 py-2 text-center flex gap-3 justify-center">
                    <button
                      onClick={() => editUser(u)}
                      className="bg-emerald-500 text-white px-3 py-1 rounded-lg hover:bg-emerald-600 transition flex items-center gap-1"
                      disabled={loading}
                    >
                      <MdEdit /> Editar
                    </button>
                    <button
                      onClick={() => deleteUser(u.username)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition flex items-center gap-1"
                      disabled={loading}
                    >
                      <MdDelete /> Remover
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




