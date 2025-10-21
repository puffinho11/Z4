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
  MdGroup
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
        const filtrados = res.data.filter(
          (a) => a.categoria?.toLowerCase() === categoria.toLowerCase()
        )
        setAtletas(filtrados.sort((a, b) => a.nome.localeCompare(b.nome)))

        setPresencas((p) => {
            const novasPresencas = {}
            filtrados.forEach((a) => {
                novasPresencas[a._id] = p[a._id] !== undefined ? p[a._id] : true
            })
            return novasPresencas
        })


      } catch (err) {
        console.error("❌ Erro ao carregar atletas:", err)
      }
    }
    fetchAtletas()
  }, [categoria])

  const handleToggle = (id) =>
    setPresencas((p) => ({ ...p, [id]: !p[id] }))

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
          presente: presencas[a._id] || false,
      }))

      const payload = {
        categoria,
        data,
        professor,
        atletas: atletasComNome,
      }

      if (editandoId) {
        await api.put(`/chamadas/${editandoId}`, payload)
        setMensagem("✅ Chamada atualizada com sucesso!")
      } else {
        await api.post("/chamadas", payload)
        setMensagem("✅ Chamada salva com sucesso!")
      }

      setCategoria("")
      setAtletas([])
      setPresencas({})
      setEditandoId(null)
      setProfessor("")
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
    setData(chamada.data)
    setProfessor(chamada.professor || "")
    setMensagem("✏️ Editando chamada existente.")
    window.scrollTo({ top: 0, behavior: "smooth" })

    try {
        const resAtletas = await api.get("/registros")
        const atletasDaCategoria = resAtletas.data.filter(
            (a) => a.categoria?.toLowerCase() === chamada.categoria.toLowerCase()
        ).sort((a, b) => a.nome.localeCompare(b.nome))
        const presenciasMap = {}
        const presencaPorNome = chamada.atletas.reduce((acc, current) => {
            acc[current.nome] = current.presente
            return acc
        }, {})

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
  
  const totalPresentes = Object.values(presencas).filter(p => p).length;
  const totalAusentes = Object.values(presencas).filter(p => !p).length;

  return (
    <section className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-blue-800 mb-2 flex items-center gap-3">
        <MdChecklist className="text-4xl" /> Controle de Presenças
      </h2>
      <p className="text-gray-500 mb-6">
        Registre a frequência dos atletas e acompanhe o histórico de chamadas.
      </p>
      <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-blue-800 border-b pb-2 mb-4 flex items-center gap-2">
          <MdSave className="text-xl" /> {editandoId ? "Editar Chamada" : "Nova Chamada"}
        </h3>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
              <MdGroup className="text-lg text-blue-600" /> Categoria
            </label>
            <select
              value={categoria}
              onChange={(e) => {
                setCategoria(e.target.value)
                setEditandoId(null)
              }}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Selecione...</option>
              {["Sub-7", "Sub-9", "Sub-11", "Sub-13", "Sub-15", "Sub-17", "Adulto"].map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
              <MdCalendarToday className="text-lg text-blue-600" /> Data
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Professor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
              <MdSupervisorAccount className="text-lg text-blue-600" /> Professor
            </label>
            <input
              type="text"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              placeholder="Digite o nome do professor"
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {categoria && (
          <>
            <h4 className="text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <MdSportsSoccer className="text-xl text-green-600" /> 
              Atletas da categoria {categoria} 
              <span className="text-sm font-normal text-gray-500">
                ({atletas.length} no total)
              </span>
            </h4>

            {atletas.length === 0 ? (
              <p className="text-gray-500 py-4 italic">
                Nenhum atleta cadastrado nesta categoria.
              </p>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Atleta
                      </th>
                      <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                        Situação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {atletas.map((a) => (
                      <tr
                        key={a._id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="p-3 font-medium text-gray-800">{a.nome}</td>
                        <td className="text-center">
                          <button
                            type="button"
                            onClick={() => handleToggle(a._id)}
                            className={`p-1.5 rounded-full transition-colors font-semibold text-xs min-w-[70px] ${
                                presencas[a._id]
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                            }`}
                            aria-label={presencas[a._id] ? "Presente" : "Ausente"}
                          >
                            {presencas[a._id] ? "Presente" : "Ausente"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2">
                <div className="text-sm font-medium text-gray-600 space-x-4">
                    <span className="text-green-700">Presentes: {totalPresentes}</span>
                    <span className="text-red-700">Ausentes: {totalAusentes}</span>
                </div>
                <div className="flex justify-end gap-3">
                    {editandoId && (
                        <button
                        onClick={() => {
                            setCategoria("");
                            setAtletas([]);
                            setPresencas({});
                            setEditandoId(null);
                            setProfessor("");
                            setMensagem(""); // Limpa mensagem
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-1"
                        >
                        <MdCancel /> Cancelar
                        </button>
                    )}
                    <button
                        onClick={handleSalvar}
                        disabled={salvando}
                        className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:bg-gray-400 transition flex items-center gap-1"
                    >
                        <MdSave />
                        {salvando
                        ? "Salvando..."
                        : editandoId
                        ? "Atualizar Chamada"
                        : "Salvar Chamada"}
                    </button>
                </div>
            </div>

            {mensagem && (
              <p
                className={`mt-4 p-3 rounded-lg font-medium text-sm ${
                  mensagem.includes("✅")
                    ? "bg-green-100 text-green-800"
                    : mensagem.includes("✏️")
                    ? "bg-yellow-100 text-yellow-800"
                    : mensagem.includes("🗑️")
                    ? "bg-red-100 text-red-800"
                    : "bg-red-100 text-red-800"
                } flex items-center gap-2`}
              >
                {mensagem.includes("✅") && '🎉'}
                {mensagem.includes("✏️") && '✍️'}
                {mensagem.includes("🗑️") && '❌'}
                {!mensagem.includes("✅") && !mensagem.includes("✏️") && !mensagem.includes("🗑️") && '🚨'}
                {mensagem}
              </p>
            )}
          </>
        )}
      </div>
      <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-blue-800 border-b pb-2 mb-4 flex items-center gap-2">
          <MdHistory className="text-2xl" /> Histórico de Chamadas ({historico.length})
        </h3>
        {historico.length === 0 ? (
          <p className="text-gray-500 py-4 italic text-center">Nenhuma chamada registrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {historico.map((c) => {
                const presentes = c.atletas.filter((a) => a.presente).length
                return (
                    <div
                        key={c._id}
                        className="p-4 bg-gray-50 border rounded-xl hover:shadow transition flex justify-between flex-wrap items-center gap-2"
                    >
                        <div>
                            <p className="font-bold text-gray-800 flex items-center gap-2">
                                <MdGroup className="text-xl text-blue-700" /> {c.categoria}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                <MdCalendarToday className="text-base" /> Data:{" "}
                                <span className="font-medium">
                                    {new Date(c.data).toLocaleDateString("pt-BR")}
                                </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <MdSupervisorAccount className="text-base" /> Prof: <span className="font-medium">{c.professor}</span>
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                                Presenças:{" "}
                                <span className="font-bold text-green-600">
                                    {presentes}
                                </span>{" "}
                                / {c.atletas.length}
                            </p>
                        </div>
                        
                        <div className="flex gap-3 text-sm">
                            <button
                                onClick={() => handleEditar(c)}
                                className="text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
                            >
                                <MdEdit /> Editar
                            </button>
                            <button
                                onClick={() => handleExcluir(c._id)}
                                className="text-red-700 hover:text-red-900 font-medium flex items-center gap-1"
                            >
                                <MdDelete /> Excluir
                            </button>
                        </div>
                    </div>
                )
            })}
          </div>
        )}
      </div>
    </section>
  )
}









