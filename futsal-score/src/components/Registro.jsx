import React, { useEffect, useState } from "react"
import api from "../api"
import { 
  MdPersonSearch, 
  MdSave, 
  MdList, 
  MdOutlineCancel, 
  MdOutlineStyle, 
  MdFitnessCenter, 
  MdHealing, 
  MdOutlineSpeed, 
  MdSportsSoccer 
} from 'react-icons/md';

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
    try {
      const { data } = await api.get("/registros")
      setLista(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Erro ao carregar registros:", err)
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

  function resetForm() {
    setForm(blank)
    setEditingId(null)
    setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const dataToSend = {
      ...form,
      treinos: +form.treinos || 0,
      lesoes: +form.lesoes || 0,
      vo2: +form.vo2 || 0,
      gols: +form.gols || 0,
      amarelos: +form.amarelos || 0,
      vermelhos: +form.vermelhos || 0,
    }

    try {
      let res
      if (editingId) {
        res = await api.put(`/registros/${editingId}`, dataToSend)
        setLista(lista.map((r) => (r._id === editingId ? res.data : r)))
      } else {
        res = await api.post("/registros", dataToSend)
        setLista([...lista, res.data])
      }
      resetForm()
      alert(editingId ? "Registro atualizado com sucesso!" : "Registro salvo com sucesso!")
    } catch (err) {
      console.error(err)
      setError("Erro ao salvar registro.")
    } finally {
      setLoading(false)
    }
  }

  function editar(registro) {
    const dataFormatada = new Date(registro.data).toISOString().slice(0, 10)
    setForm({ ...registro, data: dataFormatada })
    setEditingId(registro._id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function excluir(id) {
    if (!window.confirm("Tem certeza que deseja remover este registro?")) return
    setLoading(true)
    try {
      await api.delete(`/registros/${id}`)
      setLista(lista.filter((r) => r._id !== id))
      alert("Registro excluído com sucesso!")
    } catch {
      setError("Erro ao excluir registro.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-blue-800 mb-2 flex items-center gap-2">
        <MdPersonSearch className="text-4xl" /> Monitoramento de Atletas
      </h2>
      <p className="text-gray-500 mb-6">
        Gerencie e acompanhe os indicadores de desempenho dos jogadores.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl p-6 border border-gray-100 space-y-5 mb-8"
      >
        <h3 className="text-lg font-semibold text-blue-800 border-b pb-2 flex items-center gap-2">
          <MdSave className="text-xl" /> {editingId ? "Editar Registro" : "Novo Registro"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Atleta</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Ex: João Silva"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Categoria</label>
            <select
              value={form.categoria}
              onChange={(e) => handleChange("categoria", e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Selecione</option>
              {["Sub-7", "Sub-9", "Sub-11", "Sub-13", "Sub-15", "Sub-17", "Adulto"].map(
                (cat) => (
                  <option key={cat}>{cat}</option>
                )
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Data</label>
            <input
              type="date"
              value={form.data}
              onChange={(e) => handleChange("data", e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="OK">OK</option>
              <option value="Recuperação">Recuperação</option>
            </select>
          </div>
          {[
            { id: "treinos", label: "Treinos (Semana)", icon: <MdFitnessCenter /> },
            { id: "lesoes", label: "Lesões", icon: <MdHealing /> },
            { id: "vo2", label: "VO₂ Máx.", icon: <MdOutlineSpeed /> },
            { id: "gols", label: "Gols", icon: <MdSportsSoccer /> }, // Ícone alterado
            { id: "amarelos", label: "Cartões Amarelos", icon: <MdOutlineStyle /> },
            { id: "vermelhos", label: "Cartões Vermelhos", icon: <MdOutlineStyle /> },
          ].map((f) => (
            <div key={f.id}>
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                {f.icon} {f.label}
              </label>
              <input
                type="number"
                value={form[f.id]}
                onChange={(e) => handleChange(f.id, e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                min="0"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition flex items-center gap-1"
            >
              <MdOutlineCancel /> Cancelar Edição
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition flex items-center gap-1"
            disabled={loading}
          >
            {loading ? "Salvando..." : editingId ? (
              <>
                <MdSave /> Atualizar Registro
              </>
            ) : (
              <>
                <MdSave /> Salvar Registro
              </>
            )}
          </button>
        </div>
      </form>
      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <MdList className="text-2xl" /> Registros Salvos ({lista.length})
        </h3>

        {lista.length === 0 ? (
          <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-xl border">
            Nenhum registro encontrado.
          </p>
        ) : (
          <div className="space-y-3">
            {lista
              .slice()
              .sort((a, b) => new Date(b.data) - new Date(a.data))
              .map((r) => (
                <div
                  key={r._id}
                  className="p-4 bg-gray-50 border rounded-xl hover:shadow transition"
                >
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h4 className="font-bold text-gray-800">
                        {r.nome}{" "}
                        <span className="text-blue-600">({r.categoria})</span>
                      </h4>
                      <p className="text-sm text-gray-500">
                        Data: {new Date(r.data).toLocaleDateString("pt-BR")} •{" "}
                        <span
                          className={`font-semibold ${
                            r.status === "OK"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {r.status}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-700">
                      <span className="flex items-center gap-1"><MdOutlineSpeed className="text-lg" /> VO₂: {r.vo2}</span>
                      <span className="flex items-center gap-1"><MdSportsSoccer className="text-lg" /> Gols: {r.gols}</span> {/* Ícone alterado */}
                      <span className="flex items-center gap-1"><MdHealing className="text-lg" /> Lesões: {r.lesoes}</span>
                      <span className="flex items-center gap-1">
                        <MdOutlineStyle className="text-lg" /> Cts: {r.amarelos}/{r.vermelhos}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => editar(r)}
                        className="text-blue-700 hover:underline font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluir(r._id)}
                        className="text-red-700 hover:underline font-medium"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}