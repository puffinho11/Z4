import React, { useEffect, useState } from "react"
import api from "../api"

export default function Registro() {
  const blank = {
    nome: "",
    categoria: "",
    status: "OK",
    treinos: 3,
    lesoes: 0,
    vo2: 50,
    data: new Date().toISOString().slice(0, 10),
    gols: 0,
    amarelos: 0,
    vermelhos: 0,
  }

  const [form, setForm] = useState(blank)
  const [editingId, setEditingId] = useState(null)
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchRegistros() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get("/registros")
      setLista(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error("Erro ao carregar registros:", err.response || err)
      setError("Erro ao carregar registros. Verifique o console.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistros()
  }, [])

  function handleChange(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function handleCancel() {
    setForm(blank)
    setEditingId(null)
  }

  function editar(registro) {
    // Ao editar, a data já está no formato YYYY-MM-DD
    setForm(registro)
    setEditingId(registro._id)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = { 
        ...form, 
        id: editingId, // Enviando id para rota de POST para fazer update
    }

    try {
        const url = "/registros"
        const response = await api.post(url, payload)
        
        // Atualiza a lista com o registro retornado
        if (editingId) {
            setLista(lista.map(r => r._id === editingId ? response.data : r));
        } else {
            setLista([...lista, response.data]);
        }

        handleCancel()
        alert(editingId ? "Registro atualizado com sucesso!" : "Registro salvo com sucesso!")
    } catch (err) {
      console.error("Erro ao salvar registro:", err.response || err)
      setError("Erro ao salvar registro. Verifique o console ou a conexão com a API.")
    } finally {
      setLoading(false)
    }
  }
  
  async function excluir(id) {
    if (!window.confirm("Tem certeza que deseja excluir este registro?")) return

    setLoading(true)
    setError(null)

    try {
        await api.delete(`/registros/${id}`)
        setLista(lista.filter(r => r._id !== id))
        alert("Registro excluído com sucesso!")
    } catch (err) {
        console.error("Erro ao excluir registro:", err.response || err)
        setError("Erro ao excluir registro. Verifique o console.")
    } finally {
        setLoading(false)
    }
  }
  
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Registro de Monitoramento</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
        <h3 className="text-lg font-semibold mb-3">{editingId ? 'Editar Registro' : 'Novo Registro'}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Atleta/Nome</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={form.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoria</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={form.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Data</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={form.data}
              onChange={(e) => handleChange('data', e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 border-t pt-4">

            <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    required
                    disabled={loading}
                >
                    <option value="OK">OK</option>
                    <option value="Recuperação">Recuperação</option>
                </select>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Treinos (Semana)</label>
                <input
                    type="number"
                    min="0"
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form.treinos}
                    onChange={(e) => handleChange('treinos', parseInt(e.target.value) || 0)}
                    disabled={loading}
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Lesões (Total)</label>
                <input
                    type="number"
                    min="0"
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form.lesoes}
                    onChange={(e) => handleChange('lesoes', parseInt(e.target.value) || 0)}
                    disabled={loading}
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">VO₂ Max</label>
                <input
                    type="number"
                    step="any"
                    min="0"
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form.vo2}
                    onChange={(e) => handleChange('vo2', parseFloat(e.target.value) || 0)}
                    disabled={loading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Gols</label>
                <input
                    type="number"
                    min="0"
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form.gols}
                    onChange={(e) => handleChange('gols', parseInt(e.target.value) || 0)}
                    disabled={loading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Amarelos</label>
                <input
                    type="number"
                    min="0"
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form.amarelos}
                    onChange={(e) => handleChange('amarelos', parseInt(e.target.value) || 0)}
                    disabled={loading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Vermelhos</label>
                <input
                    type="number"
                    min="0"
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form.vermelhos}
                    onChange={(e) => handleChange('vermelhos', parseInt(e.target.value) || 0)}
                    disabled={loading}
                />
            </div>

        </div>
        
        {error && <div className="text-red-600 font-medium">{error}</div>}

        <div className="flex justify-end gap-3 pt-4">
          {editingId && (
            <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                disabled={loading}
            >
                Cancelar Edição
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Salvando..." : editingId ? "Atualizar Registro" : "Salvar Registro"}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Registros Salvos ({lista.length})</h3>
        {loading && !lista.length ? (
            <div className="text-blue-600">Carregando registros...</div>
        ) : (
            <div className="space-y-2">
            {lista.length === 0 && (
                <div className="text-gray-500">Nenhum registro encontrado no banco de dados.</div>
            )}
            {lista
                .slice()
                .reverse()
                .map((r) => (
                <div key={r._id} className="p-3 border rounded-lg flex justify-between items-center bg-white shadow-sm">
                    <div>
                    <div className="font-medium">{r.nome}</div>
                    {/* CORRIGIDO: Adicionado "T00:00:00" para forçar interpretação correta da data */}
                    <div className="text-xs text-gray-500">
                        {r.categoria} • {new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR")}
                    </div>
                    </div>
                    <div className="flex items-center gap-2">
                    <button onClick={() => editar(r)} className="text-blue-600 hover:underline text-sm" disabled={loading}>Editar</button>
                    <button onClick={() => excluir(r._id)} className="text-red-600 hover:underline text-sm" disabled={loading}>Remover</button>
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </section>
  )
}
