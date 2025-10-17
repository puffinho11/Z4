import React, { useEffect, useState } from "react"
import api from "../api"

export default function Chamada({ user }) {
  const [categoria, setCategoria] = useState("")
  const [atletas, setAtletas] = useState([])
  const [presencas, setPresencas] = useState({})
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [historico, setHistorico] = useState([])
  const [editandoId, setEditandoId] = useState(null)
  const [professor, setProfessor] = useState("")

  // 🔹 Carrega o nome do professor e o histórico
  useEffect(() => {
    let nome = ""

    // 1️⃣ Se veio via prop
    if (user?.username) {
      nome = user.username
    } else {
      // 2️⃣ Tenta pegar do localStorage
      const savedUser = localStorage.getItem("currentUser")
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser)
          nome =
            parsed?.username ||
            parsed?.name ||
            parsed?.user ||
            parsed?.nome ||
            ""
        } catch {
          nome = savedUser
        }
      }
    }

    setProfessor(nome || "Desconhecido")
    carregarHistorico()
  }, [user])

  // 🔹 Buscar histórico
  async function carregarHistorico() {
    try {
      const res = await api.get("/chamadas")
      setHistorico(res.data)
    } catch (err) {
      console.error("❌ Erro ao carregar histórico:", err)
    }
  }

  // 🔹 Buscar atletas da categoria
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

  // 🔹 Salvar ou atualizar chamada
  const handleSalvar = async () => {
    if (!categoria || atletas.length === 0) {
      alert("Selecione uma categoria e verifique se há atletas cadastrados.")
      return
    }

    setSalvando(true)
    setMensagem("")

    try {
      const payload = {
        categoria,
        data,
        professor: professor || "Desconhecido",
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
      carregarHistorico()
    } catch (err) {
      console.error("❌ Erro ao salvar chamada:", err)
      setMensagem("❌ Erro ao salvar chamada.")
    } finally {
      setSalvando(false)
    }
  }

  // 🔹 Excluir chamada
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

  // 🔹 Editar chamada
  const handleEditar = (chamada) => {
    setEditandoId(chamada._id)
    setCategoria(chamada.categoria)
    setData(chamada.data)
    setProfessor(chamada.professor || professor)
    const pres = {}
    chamada.atletas.forEach((a) => (pres[a.nome] = a.presente))
    setPresencas(pres)
    setMensagem("✏️ Editando chamada existente.")
  }

  return (
    <section className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">
        Chamada de Atletas
      </h2>

      {/* Cabeçalho */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Categoria
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
          >
            <option value="">Selecione...</option>
            <option value="Sub-7">Sub-7</option>
            <option value="Sub-9">Sub-9</option>
            <option value="Sub-11">Sub-11</option>
            <option value="Sub-13">Sub-13</option>
            <option value="Sub-15">Sub-15</option>
            <option value="Sub-17">Sub-17</option>
            <option value="Adulto">Adulto</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Data
          </label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Professor
          </label>
          <input
            type="text"
            value={professor}
            disabled
            className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2 bg-gray-100 text-gray-600"
          />
        </div>
      </div>

      {/* Lista de atletas */}
      {categoria && (
        <>
          <h3 className="text-lg font-semibold mb-2">
            Atletas da categoria {categoria}
          </h3>

          {atletas.length === 0 ? (
            <p className="text-gray-500">
              Nenhum atleta cadastrado nessa categoria.
            </p>
          ) : (
            <table className="w-full border border-gray-200 rounded-lg mb-6">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Atleta</th>
                  <th className="p-2 text-center">Presente</th>
                </tr>
              </thead>
              <tbody>
                {atletas.map((a) => (
                  <tr key={a._id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{a.nome}</td>
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

          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {salvando
              ? "Salvando..."
              : editandoId
              ? "Atualizar Chamada"
              : "Salvar Chamada"}
          </button>

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

      {/* Histórico */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold border-b pb-2 mb-4">
          Histórico de Chamadas
        </h3>
        {historico.length === 0 ? (
          <p className="text-gray-500">Nenhuma chamada registrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {historico.map((c) => (
              <div
                key={c._id}
                className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-blue-700">
                      {c.categoria}
                    </span>{" "}
                    • {new Date(c.data).toLocaleDateString("pt-BR")}
                  </div>
                  <span className="text-sm text-gray-600">
                    Professor: <b>{c.professor}</b>
                  </span>
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  Presentes:{" "}
                  <span className="font-semibold text-green-600">
                    {c.atletas.filter((a) => a.presente).length}
                  </span>{" "}
                  / {c.atletas.length} atletas
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEditar(c)}
                    className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded-md text-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(c._id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
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







