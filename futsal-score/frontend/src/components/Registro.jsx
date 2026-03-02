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
  MdSportsSoccer,
  MdPhotoCamera,
  MdDelete,
  MdEdit,
  MdEmojiEvents
} from "react-icons/md"

export default function Registro({ selectedCategoria }) {
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
    foto: "", 
    previewUrl: ""
  }

  const categorias = [
    "Sub-7",
    "Sub-9",
    "Sub-11",
    "Sub-13",
    "Sub-15",
    "Sub-17",
    "Sub-20",
    "Adulto"
  ]

  const [form, setForm] = useState(blank)
  const [editingId, setEditingId] = useState(null)
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [fotoFile, setFotoFile] = useState(null)

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

  useEffect(() => {
    if (selectedCategoria) {
      setForm((prev) => ({ ...prev, categoria: selectedCategoria }))
    }
  }, [selectedCategoria])

  function handleChange(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function resetForm() {
    setForm(blank)
    setFotoFile(null)
    setEditingId(null)
    setError(null)
  }

  async function uploadRegistroFotoIfNeeded() {
    if (!fotoFile) return null

    const fd = new FormData()
    fd.append("file", fotoFile)

    const { data } = await api.post("/upload/registro", fd, {
      headers: { "Content-Type": "multipart/form-data" }
    })

    if (!data?.url) throw new Error("Upload falhou: URL não retornou.")
    return data.url
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let fotoUrl = form.foto
      if (fotoFile) {
        fotoUrl = await uploadRegistroFotoIfNeeded()
      }

      const payload = {
        ...form,
        foto: fotoUrl || ""
      }

      delete payload.previewUrl

      let res
      if (editingId) {
        res = await api.put(`/registros/${editingId}`, payload)
        setLista(lista.map((r) => (r._id === editingId ? res.data : r)))
      } else {
        res = await api.post("/registros", payload)
        setLista([...lista, res.data])
      }

      resetForm()
      alert(editingId ? "Registro atualizado com sucesso!" : "Registro salvo com sucesso!")
    } catch (err) {
      console.error(err)
      const errorMessage =
        err.response?.data?.msg || err.message || "Erro ao salvar registro. Verifique o console."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  function editar(registro) {
    setForm({
      ...registro,
      data: new Date(registro.data).toISOString().slice(0, 10),
      previewUrl: registro.foto || "",
      foto: registro.foto || ""
    })
    setFotoFile(null)
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

  const listaFiltrada = selectedCategoria
    ? lista.filter((r) => r.categoria === selectedCategoria)
    : lista

  const registrosPorCategoria = listaFiltrada.reduce((acc, reg) => {
    if (!acc[reg.categoria]) acc[reg.categoria] = []
    acc[reg.categoria].push(reg)
    return acc
  }, {})

  const isCloudUrl = (v) => typeof v === "string" && v.startsWith("http")

  return (
    <div className="p-8 bg-white min-h-screen">
      <h2 className="text-4xl font-bold text-emerald-800 mb-3 flex items-center gap-3">
        <MdPersonSearch className="text-5xl text-emerald-600" /> Monitoramento de Atletas
        {selectedCategoria && (
          <span className="ml-3 text-lg text-emerald-700">
            • Categoria: <strong>{selectedCategoria}</strong>
          </span>
        )}
      </h2>

      <p className="text-gray-500 mb-8 text-lg">
        Gerencie e acompanhe os indicadores de desempenho dos jogadores.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 shadow">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 border border-emerald-100 space-y-6 mb-12 transition hover:shadow-emerald-300/40 hover:scale-[1.01]"
      >
        <h3 className="text-xl font-bold text-emerald-800 border-b-2 border-emerald-100 pb-3 flex items-center gap-2">
          <MdSave className="text-2xl text-emerald-600" />
          {editingId ? "Editar Registro" : "Novo Registro"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Atleta</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              className="w-full border border-emerald-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Ex: João Silva"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Categoria</label>
            <select
              value={form.categoria}
              onChange={(e) => handleChange("categoria", e.target.value)}
              className="w-full border border-emerald-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            >
              <option value="">Selecione</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Data</label>
            <input
              type="date"
              value={form.data}
              onChange={(e) => handleChange("data", e.target.value)}
              className="w-full border border-emerald-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full border border-emerald-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="OK">OK</option>
              <option value="Recuperação">Recuperação</option>
              <option value="Lesão">Lesão</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Foto do Atleta</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setFotoFile(file)
                  const previewUrl = URL.createObjectURL(file)
                  setForm((prev) => ({ ...prev, previewUrl }))
                }
              }}
              className="w-full border border-emerald-300 rounded-xl p-2.5 mt-1 cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
            />

            {form.previewUrl && (
              <img
                src={form.previewUrl}
                alt="Pré-visualização"
                className="mt-3 w-24 h-24 rounded-full object-cover border-2 border-emerald-400 shadow-md"
              />
            )}
          </div>

          {[
            { id: "treinos", label: "Treinos (Semana)", icon: <MdFitnessCenter /> },
            { id: "lesoes", label: "Lesões", icon: <MdHealing /> },
            { id: "vo2", label: "VO₂ Máx.", icon: <MdOutlineSpeed /> },
            { id: "gols", label: "Gols", icon: <MdSportsSoccer /> },
            { id: "amarelos", label: "Cartões Amarelos", icon: <MdOutlineStyle /> },
            { id: "vermelhos", label: "Cartões Vermelhos", icon: <MdOutlineStyle /> }
          ].map((f) => (
            <div key={f.id}>
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                {f.icon} {f.label}
              </label>
              <input
                type="number"
                value={form[f.id]}
                onChange={(e) => handleChange(f.id, e.target.value)}
                className="w-full border border-emerald-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded-xl hover:bg-gray-400 transition flex items-center gap-1"
            >
              <MdOutlineCancel /> Cancelar
            </button>
          )}

          <button
            type="submit"
            className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white py-2 px-6 rounded-xl shadow-md hover:shadow-emerald-300/50 hover:scale-[1.02] transition flex items-center gap-2"
            disabled={loading}
          >
            {loading ? "Salvando..." : editingId ? "Atualizar Registro" : "Salvar Registro"}
          </button>
        </div>
      </form>

      <div className="bg-white shadow-md rounded-2xl p-8 border border-emerald-100">
        <h3 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
          <MdList className="text-3xl text-emerald-600" />
          {selectedCategoria ? `Registros da categoria ${selectedCategoria}` : "Registros por Categoria"}
        </h3>

        {Object.keys(registrosPorCategoria).length === 0 ? (
          <p className="text-gray-500 text-center py-10 bg-emerald-50 rounded-2xl border">
            Nenhum registro encontrado.
          </p>
        ) : (
          Object.entries(registrosPorCategoria).map(([categoria, registros]) => (
            <div key={categoria} className="mb-10">
              {!selectedCategoria && (
                <h4 className="text-xl font-bold text-emerald-700 border-b-2 border-emerald-100 pb-3 mb-4 flex items-center gap-2">
                  <MdEmojiEvents className="text-yellow-500 text-2xl" /> {categoria}
                </h4>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {registros
                  .slice()
                  .sort((a, b) => new Date(b.data) - new Date(a.data))
                  .map((r) => (
                    <div
                      key={r._id}
                      className="bg-white border border-emerald-200 rounded-2xl p-5 flex items-center gap-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                    >
                      {r.foto ? (
                        <img
                          src={isCloudUrl(r.foto) ? r.foto : r.foto}
                          alt={r.nome}
                          className="w-20 h-20 object-cover rounded-full border-2 border-emerald-400 shadow-md"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-3xl">
                          <MdPhotoCamera />
                        </div>
                      )}

                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-800">{r.nome}</h4>
                        <p className="text-sm text-gray-500 mb-2">
                          Data: {new Date(r.data).toLocaleDateString("pt-BR")} •{" "}
                          <span
                            className={`font-semibold ${
                              r.status === "OK"
                                ? "text-green-600"
                                : r.status === "Recuperação"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {r.status}
                          </span>
                          {!selectedCategoria && <span className="ml-2">• {r.categoria}</span>}
                        </p>

                        <div className="flex flex-wrap gap-3 text-xs text-gray-700">
                          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm border">
                            <MdSportsSoccer /> {r.gols}
                          </span>
                          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm border">
                            <MdOutlineSpeed /> VO₂: {r.vo2}
                          </span>
                          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm border">
                            <MdHealing /> {r.lesoes}
                          </span>
                          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm border">
                            <MdOutlineStyle /> Am: {r.amarelos}
                          </span>
                          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm border">
                            <MdOutlineStyle /> Vm: {r.vermelhos}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => editar(r)}
                          className="text-emerald-600 font-medium hover:text-emerald-800 flex items-center gap-1"
                        >
                          <MdEdit /> Editar
                        </button>
                        <button
                          onClick={() => excluir(r._id)}
                          className="text-red-600 font-medium hover:text-red-800 flex items-center gap-1"
                        >
                          <MdDelete /> Excluir
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}




