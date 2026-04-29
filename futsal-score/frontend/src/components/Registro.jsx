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
    cpf: "",
    dataNascimento: "",
    sexo: "",
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

  const [form, setForm] = useState(blank)
  const [editingId, setEditingId] = useState(null)
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function calcularIdade(dataNascimento) {
    if (!dataNascimento) return null

    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }

    return idade
  }

  function definirCategoria(dataNascimento, sexo) {
    const idade = calcularIdade(dataNascimento)

    if (!idade || !sexo) return ""

    let categoriaBase = ""

    if (idade <= 7) categoriaBase = "Sub-7"
    else if (idade <= 9) categoriaBase = "Sub-9"
    else if (idade <= 11) categoriaBase = "Sub-11"
    else if (idade <= 13) categoriaBase = "Sub-13"
    else if (idade <= 15) categoriaBase = "Sub-15"
    else if (idade <= 17) categoriaBase = "Sub-17"
    else if (idade <= 20) categoriaBase = "Sub-20"
    else categoriaBase = "Adulto"

    return `${categoriaBase} ${sexo}`
  }

  function formatarCPF(value) {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14)
  }

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
    setForm((prev) => {
      const novoForm = { ...prev, [k]: v }

      if (k === "cpf") {
        novoForm.cpf = formatarCPF(v)
      }

      if (k === "dataNascimento" || k === "sexo") {
        novoForm.categoria = definirCategoria(
          k === "dataNascimento" ? v : novoForm.dataNascimento,
          k === "sexo" ? v : novoForm.sexo
        )
      }

      return novoForm
    })
  }

  function resetForm() {
    setForm({
      ...blank,
      categoria: selectedCategoria || ""
    })
    setEditingId(null)
    setError(null)
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  async function handleFotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const base64 = await fileToBase64(file)
      setForm((prev) => ({
        ...prev,
        foto: base64,
        previewUrl: base64
      }))
    } catch (err) {
      console.error("Erro ao converter imagem:", err)
      setError("Erro ao carregar a imagem.")
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        nome: form.nome,
        cpf: form.cpf,
        dataNascimento: form.dataNascimento,
        sexo: form.sexo,
        categoria: form.categoria,
        status: form.status,
        treinos: Number(form.treinos) || 0,
        lesoes: Number(form.lesoes) || 0,
        vo2: Number(form.vo2) || 0,
        data: form.data,
        gols: Number(form.gols) || 0,
        amarelos: Number(form.amarelos) || 0,
        vermelhos: Number(form.vermelhos) || 0,
        foto: form.foto || ""
      }

      let res

      if (editingId) {
        res = await api.put(`/registros/${editingId}`, payload)
        setLista((prev) =>
          prev.map((r) => (r._id === editingId ? res.data : r))
        )
        alert("Registro atualizado com sucesso!")
      } else {
        res = await api.post("/registros", payload)
        setLista((prev) => [...prev, res.data])
        alert("Registro salvo com sucesso!")
      }

      resetForm()
    } catch (err) {
      console.error(err)
      const errorMessage =
        err.response?.data?.msg ||
        err.response?.data?.error ||
        err.message ||
        "Erro ao salvar registro. Verifique o console."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  function editar(registro) {
    setForm({
      nome: registro.nome || "",
      cpf: registro.cpf || "",
      dataNascimento: registro.dataNascimento
        ? new Date(registro.dataNascimento).toISOString().slice(0, 10)
        : "",
      sexo: registro.sexo || "",
      categoria: registro.categoria || "",
      status: registro.status || "OK",
      treinos: registro.treinos ?? 3,
      lesoes: registro.lesoes ?? 0,
      vo2: registro.vo2 ?? 50,
      data: registro.data
        ? new Date(registro.data).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      gols: registro.gols ?? 0,
      amarelos: registro.amarelos ?? 0,
      vermelhos: registro.vermelhos ?? 0,
      foto: registro.foto || "",
      previewUrl: registro.foto || ""
    })

    setEditingId(registro._id)
    setError(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function excluir(id) {
    if (!window.confirm("Tem certeza que deseja remover este registro?")) return

    setLoading(true)
    try {
      await api.delete(`/registros/${id}`)
      setLista((prev) => prev.filter((r) => r._id !== id))
      alert("Registro excluído com sucesso!")
    } catch (err) {
      console.error(err)
      setError("Erro ao excluir registro.")
    } finally {
      setLoading(false)
    }
  }

  const listaFiltrada = selectedCategoria
    ? lista.filter((r) => r.categoria === selectedCategoria)
    : lista

  const registrosPorCategoria = listaFiltrada.reduce((acc, reg) => {
    const sexoGrupo = reg.sexo || "Não informado"
    const categoriaGrupo = reg.categoria || "Sem categoria"

    if (!acc[sexoGrupo]) acc[sexoGrupo] = {}
    if (!acc[sexoGrupo][categoriaGrupo]) acc[sexoGrupo][categoriaGrupo] = []

    acc[sexoGrupo][categoriaGrupo].push(reg)

    return acc
  }, {})

  return (
    <div className="p-8 bg-white min-h-screen">
      <h2 className="text-4xl font-bold text-emerald-800 mb-3 flex items-center gap-3">
        <MdPersonSearch className="text-5xl text-emerald-600" />
        Monitoramento de Atletas
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
        className="bg-white shadow-lg rounded-2xl p-8 border border-emerald-100 space-y-6 mb-12"
      >
        <h3 className="text-xl font-bold text-emerald-800 border-b-2 border-emerald-100 pb-3 flex items-center gap-2">
          <MdSave className="text-2xl text-emerald-600" />
          {editingId ? "Editar Registro" : "Novo Registro"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Atleta
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              className="w-full border border-emerald-300 rounded-xl p-2.5 mt-1"
              placeholder="Ex: João Silva"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              CPF
            </label>
            <input
              type="text"
              value={form.cpf}
              onChange={(e) => handleChange("cpf", e.target.value)}
              className="w-full border border-emerald-300 rounded-xl p-2.5 mt-1"
              placeholder="000.000.000-00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Data de Nascimento
            </label>
            <input
              type="date"
              value={form.dataNascimento}
              onChange={(e) => handleChange("dataNascimento", e.target.value)}
              className="w-full border border-emerald-300 rounded-xl p-2.5 mt-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Sexo
            </label>
            <select
              value={form.sexo}
              onChange={(e) => handleChange("sexo", e.target.value)}
              className="w-full border border-emerald-300 rounded-xl p-2.5 mt-1"
              required
            >
              <option value="">Selecione</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Categoria Automática
            </label>
            <input
              type="text"
              value={form.categoria}
              readOnly
              className="w-full border border-emerald-300 rounded-xl p-2.5 mt-1 bg-gray-100"
              placeholder="Será preenchida automaticamente"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Data do Registro
            </label>
            <input
              type="date"
              value={form.data}
              onChange={(e) => handleChange("data", e.target.value)}
              className="w-full border border-emerald-300 rounded-xl p-2.5 mt-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full border border-emerald-300 rounded-xl p-2.5 mt-1"
            >
              <option value="OK">OK</option>
              <option value="Recuperação">Recuperação</option>
              <option value="Lesão">Lesão</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Foto do Atleta
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="w-full border border-emerald-300 rounded-xl p-2.5 mt-1 cursor-pointer"
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
                className="w-full border border-emerald-300 rounded-xl p-2.5 mt-1"
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
            className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white py-2 px-6 rounded-xl shadow-md hover:scale-[1.02] transition flex items-center gap-2"
            disabled={loading}
          >
            {loading ? "Salvando..." : editingId ? "Atualizar Registro" : "Salvar Registro"}
          </button>
        </div>
      </form>

      <div className="bg-white shadow-md rounded-2xl p-8 border border-emerald-100">
        <h3 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
          <MdList className="text-3xl text-emerald-600" />
          Registros por Categoria
        </h3>

        {Object.keys(registrosPorCategoria).length === 0 ? (
          <p className="text-gray-500 text-center py-10 bg-emerald-50 rounded-2xl border">
            Nenhum registro encontrado.
          </p>
        ) : (
          Object.entries(registrosPorCategoria).map(([sexo, categorias]) => (
            <div key={sexo} className="mb-12">
              <h3 className="text-2xl font-bold text-emerald-900 mb-5">
                Categoria {sexo}
              </h3>

              {Object.entries(categorias).map(([categoria, registros]) => (
                <div key={categoria} className="mb-10">
                  <h4 className="text-xl font-bold text-emerald-700 border-b-2 border-emerald-100 pb-3 mb-4 flex items-center gap-2">
                    <MdEmojiEvents className="text-yellow-500 text-2xl" />
                    {categoria}
                  </h4>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {registros
                      .slice()
                      .sort((a, b) => new Date(b.data) - new Date(a.data))
                      .map((r) => (
                        <div
                          key={r._id}
                          className="bg-white border border-emerald-200 rounded-2xl p-5 flex items-center gap-5 hover:shadow-lg transition-all duration-200"
                        >
                          {r.foto ? (
                            <img
                              src={r.foto}
                              alt={r.nome}
                              className="w-20 h-20 object-cover rounded-full border-2 border-emerald-400 shadow-md"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-3xl">
                              <MdPhotoCamera />
                            </div>
                          )}

                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-800">
                              {r.nome}
                            </h4>

                            <p className="text-sm text-gray-500">
                              CPF: {r.cpf || "Não informado"}
                            </p>

                            <p className="text-sm text-gray-500">
                              Nascimento:{" "}
                              {r.dataNascimento
                                ? new Date(r.dataNascimento).toLocaleDateString("pt-BR")
                                : "Não informado"}
                            </p>

                            <p className="text-sm text-gray-500 mb-2">
                              Registro: {new Date(r.data).toLocaleDateString("pt-BR")} •{" "}
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
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}




