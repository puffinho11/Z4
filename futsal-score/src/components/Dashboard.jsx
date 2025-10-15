import React, { useEffect, useState } from "react"
import api from "../api"

export default function Dashboard() {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchRegistros() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get("/registros")
      setRegistros(Array.isArray(response.data) ? response.data : []) 
    } catch (err) {
      console.error("Erro ao carregar registros para o Dashboard:", err.response || err)
      const msg = "Erro ao carregar dados do Dashboard. Verifique sua conexão e login."
      setError(msg)
      setRegistros([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistros()
  }, [])

  const atletasCount = [...new Set(registros.map((r) => r.nome))].length
  
  const ultimos30 = registros.filter((r) => {
    const d = new Date(r.data); 
    const ago = new Date()
    ago.setDate(ago.getDate() - 30)
    return d >= ago
  }).length

  const emRecuperacao = registros.filter((r) => r.status === "Recuperação").length

  const totalLesoes = registros.reduce((acc, r) => acc + (Number(r.lesoes) || 0), 0)

  const totalVo2 = registros.reduce((acc, r) => acc + (Number(r.vo2) || 0), 0)
  const mediaVo2 = registros.length > 0 ? (totalVo2 / registros.length).toFixed(1) : 0
  const totalGols = registros.reduce((acc, r) => acc + (Number(r.gols) || 0), 0)
  const totalAmarelos = registros.reduce((acc, r) => acc + (Number(r.amarelos) || 0), 0)
  const totalVermelhos = registros.reduce((acc, r) => acc + (Number(r.vermelhos) || 0), 0)


  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      {loading && <div className="text-blue-600 p-4">Carregando dados do Dashboard...</div>}
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      {!loading && !error && (
        <>
          <div className="bg-white rounded-2xl shadow p-6 fade-in-up">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="text-sm text-gray-500">Atletas únicos</h3>
                <p className="text-3xl font-bold mt-2 text-blue-800">{atletasCount}</p>
              </div>
              <div className="p-4 border rounded-lg bg-green-50">
                <h3 className="text-sm text-gray-500">Registros (30 dias)</h3>
                <p className="text-3xl font-bold mt-2 text-green-800">{ultimos30}</p>
              </div>
              <div className="p-4 border rounded-lg bg-yellow-50">
                <h3 className="text-sm text-gray-500">Em recuperação (registros)</h3>
                <p className="text-3xl font-bold mt-2 text-yellow-800">{emRecuperacao}</p>
              </div>
              <div className="p-4 border rounded-lg bg-red-50">
                <h3 className="text-sm text-gray-500">Média VO₂ Máximo</h3>
                <p className="text-3xl font-bold mt-2 text-red-800">{mediaVo2}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow">
              <h3 className="font-semibold mb-3">Últimos registros de monitoramento</h3>
              <div className="text-sm text-gray-700">
                {registros.length === 0 && (
                  <p className="text-gray-400">Nenhum registro salvo ainda.</p>
                )}
                {registros
                  .slice()
                  .sort((a, b) => new Date(b.data) - new Date(a.data))
                  .slice(0, 6)
                  .map((r) => (
                    <div key={r._id} className="border-b py-2">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{r.nome}</div>
                          <div className="text-xs text-gray-500">{r.categoria}</div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {new Date(r.data).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow">
              <h3 className="font-semibold mb-3">Resumo Geral de Ocorrências</h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Total de Lesões Reportadas</span>
                    <span className="text-lg font-bold text-red-700">{totalLesoes}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Total de Gols (Todos os registros)</span>
                    <span className="text-lg font-bold text-green-700">{totalGols}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Cartões Amarelos</span>
                    <span className="text-lg font-bold text-yellow-700">{totalAmarelos}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cartões Vermelhos</span>
                    <span className="text-lg font-bold text-red-700">{totalVermelhos}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                *O Dashboard exibe os dados consolidados de todos os registros salvos no banco de dados.
              </p>
            </div>
            
          </div>
        </>
      )}
    </section>
  )
}

