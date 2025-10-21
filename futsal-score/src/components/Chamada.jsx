import React, { useEffect, useState } from "react"
import api from "../api"

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
      setHistorico(res.data)
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
        setAtletas(filtrados)
        setPresencas(Object.fromEntries(filtrados.map((a) => [a._id, true])))
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
      const payload = {
        categoria,
        data,
        professor,
        atletas: atletas.map((a) => ({
          nome: a.nome,
          presente: presencas[a._id] || false,
        })),
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

  const handleEditar = (chamada) => {
    setEditandoId(chamada._id)
    setCategoria(chamada.categoria)
    setData(chamada.data)
    setProfessor(chamada.professor || "")
    const pres = {}
    chamada.atletas.forEach((a) => (pres[a.nome] = a.presente))
    setPresencas(pres);
    setMensagem("✏️ Editando chamada existente.")
  }
  return (
    <section className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-blue-800 mb-2">
        📋 Controle de Presenças
      </h2>
      <p className="text-gray-500 mb-6">
        Registre a frequência dos atletas e acompanhe o histórico de chamadas.
      </p>
      <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-blue-800 border-b pb-2 mb-4">
          {editandoId ? "Editar Chamada" : "Nova Chamada"}
        </h3>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Categoria
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Selecione...</option>
              {["Sub-7","Sub-9","Sub-11","Sub-13","Sub-15","Sub-17","Adulto"].map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Professor</label>
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
            <h4 className="text-lg font-semibold mb-2 text-gray-800">
              Atletas da categoria {categoria}
            </h4>

            {atletas.length === 0 ? (
              <p className="text-gray-500">
                Nenhum atleta cadastrado nesta categoria.
              </p>
            ) : (
              <table className="w-full border border-gray-200 rounded-lg mb-6">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left text-sm font-semibold text-gray-600">
                      Atleta
                    </th>
                    <th className="p-2 text-center text-sm font-semibold text-gray-600">
                      Presente
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {atletas.map((a) => (
                    <tr
                      key={a._id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="p-2 text-gray-800">{a.nome}</td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={!!presencas[a._id]}
                          onChange={() => handleToggle(a._id)}
                          className="h-5 w-5 text-blue-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="flex justify-end gap-3">
              {editandoId && (
                <button
                  onClick={() => {
                    setCategoria("");
                    setAtletas([]);
                    setPresencas({});
                    setEditandoId(null);
                    setProfessor("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleSalvar}
                disabled={salvando}
                className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:bg-gray-400 transition"
              >
                {salvando
                  ? "Salvando..."
                  : editandoId
                  ? "Atualizar Chamada"
                  : "Salvar Chamada"}
              </button>
            </div>

            {mensagem && (
              <p
                className={`mt-4 font-medium ${
                  mensagem.includes("✅")
                    ? "text-green-600"
                    : mensagem.includes("✏️")
                    ? "text-yellow-600"
                    : mensagem.includes("🗑️")
                    ? "text-red-600"
                    : "text-red-600"
                }`}
              >
                {mensagem}
              </p>
            )}
          </>
        )}
      </div>
      <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-blue-800 border-b pb-2 mb-4">
          Histórico de Chamadas ({historico.length})
        </h3>
        {historico.length === 0 ? (
          <p className="text-gray-500">Nenhuma chamada registrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {historico.map((c) => (
              <div
                key={c._id}
                className="p-4 bg-gray-50 border rounded-xl hover:shadow transition flex justify-between flex-wrap items-center gap-2"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {c.categoria} •{" "}
                    <span className="text-gray-600">
                      {new Date(c.data).toLocaleDateString("pt-BR")}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Professor: <span className="font-medium">{c.professor}</span>
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    Presenças:{" "}
                    <span className="font-semibold text-green-600">
                      {c.atletas.filter((a) => a.presente).length}
                    </span>{" "}
                    / {c.atletas.length}
                  </p>
                </div>
                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() => handleEditar(c)}
                    className="text-blue-700 hover:underline font-medium"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(c._id)}
                    className="text-red-700 hover:underline font-medium"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}









