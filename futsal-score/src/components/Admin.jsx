import React, { useState, useEffect } from "react"
import api from "../api"

export default function Admin() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ username: "", password: "", role: "user" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editingUsername, setEditingUsername] = useState(null);

  async function fetchUsers() {
    setLoading(true)
    setError(null)
   
    try {
      const response = await api.get("/users")
      setUsers(response.data);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err.response || err)
      const status = err.response?.status
      const msg = status === 403 || status === 401 
        ? "Acesso negado. Você não é um administrador ou seu token expirou."
        : err.response?.data?.msg || "Erro ao carregar lista de usuários. Verifique o console."
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
    setForm({ username: user.username, password: "", role: user.role })
    setEditingUsername(user.username)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const { username, password, role } = form
    
    if (!username || (!password && !editingUsername)) { 
      alert("Preencha o nome de usuário e a senha (se estiver criando).")
      return
    }

    setLoading(true)
    try {
        if (editingUsername) {

            await api.put(`/users/${editingUsername}`, { username, password, role })
        } else {

            await api.post("/users/register", { username, password, role })
        }
        
        await fetchUsers() 

        setForm({ username: "", password: "", role: "user" })
        setEditingUsername(null)
        alert(editingUsername ? "Usuário atualizado com sucesso!" : "Usuário criado com sucesso!")

    } catch (err) {
        console.error("Erro ao salvar usuário:", err.response || err)
        const msg = err.response?.data?.msg || "Erro ao salvar usuário. Verifique o console."
        setError(msg)
    } finally {
        setLoading(false)
    }
  }

  async function deleteUser(username) {
    if (window.confirm(`Tem certeza que deseja remover o usuário ${username}?`)) {
        setLoading(true)
        try {

            await api.delete(`/users/${username}`)
            
            await fetchUsers() 
            
            alert(`Usuário ${username} removido com sucesso!`)

        } catch (err) {
            console.error("Erro ao remover usuário:", err.response || err)
            const msg = err.response?.data?.msg || "Erro ao remover usuário. Verifique o console."
            setError(msg)
        } finally {
            setLoading(false)
        }
    }
  }

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-6">Administração de Usuários</h2>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow mb-8">
        <h3 className="text-xl font-semibold mb-4">
          {editingUsername ? `Editar: ${editingUsername}` : "Criar Novo Usuário"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuário
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              required
              disabled={loading || editingUsername} 
            />
             {editingUsername && <p className="text-xs text-gray-500 mt-1">Nome de usuário não pode ser editado.</p>}
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha {editingUsername && <span className="text-xs text-gray-500">(Opcional para edição)</span>}
            </label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required={!editingUsername}
              disabled={loading}
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Papel
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
              required
              disabled={loading}
            >
              <option value="user">Usuário Comum</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          <div className="md:col-span-1 flex items-end gap-3">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Aguarde..." : editingUsername ? "Salvar Edição" : "Criar Usuário"}
            </button>
            <button
                type="button"
                onClick={() => {
                    setForm({ username: "", password: "", role: "user" })
                    setEditingUsername(null)
                }}
                className="px-3 py-2 rounded-lg border flex-shrink-0"
                disabled={loading}
                >
                Limpar
            </button>
          </div>

        </div>
      </form>

      <div className="mt-6 bg-white p-6 rounded-2xl shadow">
        <h3 className="font-semibold mb-4">Lista de Usuários ({users.length})</h3>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Usuário</th>
              <th className="px-3 py-2 text-left">Papel</th>
              <th className="px-3 py-2 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 && !loading ? (
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
                  <td className="px-3 py-2 text-center flex gap-3 justify-center">
                    <button
                      onClick={() => editUser(u)}
                      className="text-blue-600 hover:underline"
                      disabled={loading}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteUser(u.username)}
                      className="text-red-600 hover:underline"
                      disabled={loading}
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