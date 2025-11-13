import React, { useEffect, useState } from "react"
import api from "../api"
import {
  MdChecklist,
  MdSave,
  MdCancel,
  MdHistory,
  MdEdit,
  MdDelete,
  MdCalendarToday,
  MdSportsSoccer,
  MdSupervisorAccount,
  MdGroup,
} from "react-icons/md"

export default function Chamada() {
  const [categoria, setCategoria] = useState("")
  const [atletas, setAtletas] = useState([])
  const [presencas, setPresencas] = useState({})
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [historico, setHistorico] = useState([])
  const [editandoId, setEditandoId] = useState(null)
  const [professor, setProfessor] = useState("")

  useEffect(() => {
    carregarHistorico()
  }, [])

  async function carregarHistorico() {
    try {
      const res = await api.get("/chamadas")
      const sortedHistorico = res.data.sort((a, b) => new Date(b.data) - new Date(a.data))
      setHistorico(sortedHistorico)
    } catch (err) {
      console.error("❌ Erro ao carregar histórico:", err)
    }
  }

  useEffect(() => {
    async function fetchAtletas() {
      if (!categoria) return
      try {
        const res = await api.get("/registros")
        const filtrados = res.data
          .filter((a) => a.categoria?.toLowerCase() === categoria.toLowerCase())
          .sort((a, b) => a.nome.localeCompare(b.nome))

        setAtletas(filtrados)

        // mantém escolhas anteriores quando possível; default = presente (true)
        setPresencas((p) => {
          const novas = {}
          filtrados.forEach((a) => {
            novas[a._id] = p[a._id] !== undefined ? p[a._id] : true
          })
          return novas
        })
      } catch (err) {
        console.error("❌ Erro ao carregar atletas:", err)
      }
    }
    fetchAtletas()
  }, [categoria])

  const handleToggle = (id) => setPresencas((p) => ({ ...p, [id]: !p[id] }))

  const handleSalvar = async () => {
    if (!categoria || atletas.length === 0 || !professor.trim()) {
      alert("Preencha o nome do professor e selecione uma categoria.")
      return
    }
    setSalvando(true)
    setMensagem("")
    try {
      const atletasComNome = atletas.map((a) => ({
        nome: a.nome,
        presente: !!presencas[a._id],
      }))

      const payload = { categoria, data, professor, atletas: atletasComNome }

      if (editandoId) {
        await api.put(`/chamadas/${editandoId}`, payload)
        setMensagem("✅ Chamada atualizada com sucesso!")
      } else {
        await api.post("/chamadas", payload)
        setMensagem("✅ Chamada salva com sucesso!")
      }

      // reset
      setEditandoId(null)
      setCategoria("")
      setAtletas([])
      setPresencas({})
      setProfessor("")
      setData(new Date().toISOString().slice(0, 10))

      carregarHistorico()
    } catch (err) {
      console.error("❌ Erro ao salvar chamada:", err)
      setMensagem("❌ Erro ao salvar chamada.")
    } finally {
      setSalvando(false)
    }
  }

  const handleExcluir = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta chamada?")) return
    try {
      await api.delete(`/chamadas/${id}`)
      setMensagem("🗑️ Chamada excluída com sucesso!")
      carregarHistorico()
    } catch (err) {
      console.error("❌ Erro ao excluir chamada:", err)
      setMensagem("❌ Erro ao excluir chamada.")
    }
  }

  const handleEditar = async (chamada) => {
    setEditandoId(chamada._id)
    setCategoria(chamada.categoria)
    setData(chamada.data?.slice(0, 10) || new Date().toISOString().slice(0, 10))
    setProfessor(chamada.professor || "")
    setMensagem("✏️ Editando chamada existente.")
    window.scrollTo({ top: 0, behavior: "smooth" })

    try {
      const resAtletas = await api.get("/registros")
      const atletasDaCategoria = resAtletas.data
        .filter((a) => a.categoria?.toLowerCase() === chamada.categoria.toLowerCase())
        .sort((a, b) => a.nome.localeCompare(b.nome))

      // mapeia presenças por nome da chamada selecionada
      const presencaPorNome = chamada.atletas.reduce((acc, curr) => {
        acc[curr.nome] = !!curr.presente
        return acc
      }, {})

      // converte para o mapa de presenças por _id atuais
      const presenciasMap = {}
      atletasDaCategoria.forEach((a) => {
        presenciasMap[a._id] = presencaPorNome[a.nome] || false
      })

      setAtletas(atletasDaCategoria)
      setPresencas(presenciasMap)
    } catch (err) {
      console.error("❌ Erro ao carregar atletas para edição:", err)
      setMensagem("❌ Erro ao carregar atletas da categoria para edição.")
    }
  }

  const totalPresentes = Object.values(presencas).filter(Boolean).length
  const totalAusentes = Object.values(presencas).filter((p) => !p).length

  return (
    // MOBILE-ONLY FEEL: centraliza e limita largura em telas grandes; 100% no mobile
    <section className="p-4 bg-white min-h-screen flex justify-center">
      <div className="w-full max-w-md">
        {/* Cabeçalho */}
        <h2 className="text-2xl sm:text-3xl font-bold text-emerald-800 mb-2 flex items-center gap-3">
          <MdChecklist className="text-3xl sm:text-4xl text-emerald-600" />
          Controle de Presenças
        </h2>
        <p className="text-gray-600 mb-4 text-sm sm:text-base">
          Registre a frequência dos atletas e acompanhe o histórico.
        </p>

        {/* Card principal */}
        <div className="bg-white shadow-md rounded-2xl p-4 border border-emerald-100 mb-6">
          <h3 className="text-lg font-semibold text-emerald-800 border-b pb-2 mb-3 flex items-center gap-2">
            <MdSave className="text-xl text-emerald-600" />
            {editandoId ? "Editar Chamada" : "Nova Chamada"}
          </h3>

          {/* Campos topo - empilhados (mobile-first) */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              <MdGroup className="text-lg text-emerald-600" /> Categoria
            </label>
            <select
              value={categoria}
              onChange={(e) => {
                setCategoria(e.target.value)
                setEditandoId(null)
                setMensagem("")
              }}
              className="border border-emerald-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Selecione a categoria</option>
              {["Sub-7", "Sub-9", "Sub-11", "Sub-13", "Sub-15", "Sub-17", "Sub-20", "Adulto"].map(
                (cat) => (
                  <option key={cat}>{cat}</option>
                )
              )}
            </select>

            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              <MdCalendarToday className="text-lg text-emerald-600" /> Data
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="border border-emerald-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
            />

            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              <MdSupervisorAccount className="text-lg text-emerald-600" /> Professor
            </label>
            <input
              type="text"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              placeholder="Professor responsável"
              className="border border-emerald-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Lista de atletas (tocável) */}
          {categoria && (
            <div className="mt-5">
              <h4 className="text-lg font-semibold mb-3 text-emerald-800 flex items-center gap-2">
                <MdSportsSoccer className="text-xl text-emerald-600" />
                Atletas — {categoria}{" "}
                <span className="text-sm font-normal text-gray-500">
                  ({atletas.length} no total)
                </span>
              </h4>

              {atletas.length === 0 ? (
                <p className="text-gray-500 italic text-sm">
                  Nenhum atleta cadastrado nesta categoria.
                </p>
              ) : (
                <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
                  {atletas.map((a) => (
                    <button
                      key={a._id}
                      type="button"
                      onClick={() => handleToggle(a._id)}
                      className={`flex justify-between items-center px-4 py-3 rounded-lg text-sm font-medium shadow-sm transition-all ${
                        presencas[a._id]
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-700"
                      }`}
                      aria-label={presencas[a._id] ? "Presente" : "Ausente"}
                    >
                      <span className="text-left">{a.nome}</span>
                      <span className="font-bold text-base">
                        {presencas[a._id] ? "✔" : "✘"}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-between text-xs text-gray-600 mt-3">
                <span className="text-emerald-700">✅ Presentes: {totalPresentes}</span>
                <span className="text-red-700">❌ Ausentes: {totalAusentes}</span>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            {editandoId && (
              <button
                type="button"
                onClick={() => {
                  setCategoria("")
                  setAtletas([])
                  setPresencas({})
                  setEditandoId(null)
                  setProfessor("")
                  setMensagem("")
                  setData(new Date().toISOString().slice(0, 10))
                }}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition flex items-center gap-1 justify-center"
              >
                <MdCancel /> Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={handleSalvar}
              disabled={salvando}
              className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-6 py-2 rounded-lg hover:scale-[1.03] transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
            >
              <MdSave />
              {salvando ? "Salvando..." : editandoId ? "Atualizar Chamada" : "Salvar Chamada"}
            </button>
          </div>

          {mensagem && (
            <p
              className={`mt-4 p-3 rounded-lg font-medium text-sm text-center ${
                mensagem.includes("✅")
                  ? "bg-emerald-100 text-emerald-800"
                  : mensagem.includes("✏️")
                  ? "bg-yellow-100 text-yellow-800"
                  : mensagem.includes("🗑️")
                  ? "bg-red-100 text-red-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {mensagem}
            </p>
          )}
        </div>

        {/* Histórico (compacto e rolável) */}
        <div className="bg-white shadow-md rounded-2xl p-4 border border-emerald-100">
          <h3 className="text-lg font-semibold text-emerald-800 border-b pb-2 mb-3 flex items-center gap-2">
            <MdHistory className="text-xl text-emerald-600" /> Histórico de Chamadas ({historico.length})
          </h3>

          {historico.length === 0 ? (
            <p className="text-gray-500 italic text-sm text-center">
              Nenhuma chamada registrada.
            </p>
          ) : (
            <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1">
              {historico.map((c) => {
                const presentes = c.atletas.filter((a) => a.presente).length
                return (
                  <div
                    key={c._id}
                    className="p-3 border border-emerald-100 rounded-lg flex justify-between items-center hover:bg-emerald-50 transition"
                  >
                    <div>
                      <p className="font-semibold text-emerald-800 flex items-center gap-2">
                        <MdGroup className="text-lg text-emerald-700" /> {c.categoria}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        <MdCalendarToday className="text-base text-emerald-600" />{" "}
                        {new Date(c.data).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        Presenças: <span className="font-bold text-emerald-700">{presentes}</span> / {c.atletas.length}
                      </p>
                    </div>

                    <div className="flex gap-3 text-base">
                      <button
                        type="button"
                        onClick={() => handleEditar(c)}
                        className="text-emerald-700 hover:text-emerald-900"
                        title="Editar"
                      >
                        <MdEdit />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExcluir(c._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Excluir"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}











