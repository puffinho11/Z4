import React, { useEffect, useState } from "react"
import api from "../api"
import Countdown from "./Countdown"

export default function Dashboard() {
  const [registros, setRegistros] = useState([])
  const [eventos, setEventos] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchEventos() {
    try {
      const response = await api.get("/calendario")
      setEventos(Array.isArray(response.data) ? response.data : []) 
    } catch (err) {
      console.error("Erro ao carregar eventos do calendário:", err.response || err)
    }
  }

  async function fetchRegistros() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get("/registros")
      setRegistros(Array.isArray(response.data) ? response.data : [])
      await fetchEventos()
    } catch (err) {
      console.error("Erro ao carregar registros:", err.response || err)
      setError("Erro ao carregar dados. Verifique o servidor ou login.")
      setRegistros([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistros()
  }, []);

  const atletasCount = [...new Set(registros.map((r) => r.nome))].length
  const ultimos30 = registros.filter((r) => {
    const d = new Date(r.data)
    const ago = new Date()
    ago.setDate(ago.getDate() - 30)
    return d >= ago
  }).length;
  const emRecuperacao = registros.filter(
    (r) => r.status === "Recuperação" || r.status === "Lesão"
  ).length

  const totalLesoes = registros.reduce(
    (sum, r) => sum + (Number(r.lesoes) || 0),
    0
  )
  const totalGols = registros.reduce((sum, r) => sum + (Number(r.gols) || 0), 0);
  const totalAmarelos = registros.reduce(
    (sum, r) => sum + (Number(r.amarelos) || 0),
    0
  )
  const totalVermelhos = registros.reduce(
    (sum, r) => sum + (Number(r.vermelhos) || 0),
    0
  )

  const eventosFuturos = eventos
    .map((ev) => ({
      ...ev,

      dateTime: new Date(ev.data + "T" + (ev.hora || "00:00")),
    }))

    .filter((ev) => ev.dateTime.getTime() > new Date().getTime() - 60000) 

    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()) 

  const proximoEvento = eventosFuturos[0]

  const listaProximosEventos = eventosFuturos.slice(
    proximoEvento ? 1 : 0, 
    proximoEvento ? 6 : 5 
  )

  return (
    <section className="p-8 ml-64 min-h-screen bg-gray-50">
      <h2 className="text-3xl font-bold mb-8 text-blue-800">
        Painel de Gestão de Atletas
      </h2>

      {loading && (
        <p className="text-blue-600 animate-pulse">Carregando dados...</p>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 shadow">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Atletas Registrados" value={atletasCount} color="blue" />
            <Card title="Últimos 30 Dias" value={ultimos30} color="purple" />
            <Card title="Em Recuperação" value={emRecuperacao} color="red" />
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-1">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Resumo de Ocorrências
              </h3>
              <ResumoItem label="Lesões" value={totalLesoes} color="red" />
              <ResumoItem label="Gols" value={totalGols} color="green" />
              <ResumoItem
                label="Cartões Amarelos"
                value={totalAmarelos}
                color="yellow"
              />
              <ResumoItem
                label="Cartões Vermelhos"
                value={totalVermelhos}
                color="red"
              />
            </div>
            <div className="lg:col-span-2 space-y-4">
                
                {proximoEvento ? (
                    <Countdown
                      targetDate={proximoEvento.dateTime.toISOString()}
                      eventTitle={
                        proximoEvento.titulo +
                        (proximoEvento.adversario
                          ? ` vs ${proximoEvento.adversario}`
                          : "")
                      }
                      eventLocal={proximoEvento.local}
                    />
                ) : (
                    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-center items-center text-gray-500">
                        <p className="italic">
                            🗓️ Nenhum evento futuro no calendário.
                        </p>
                    </div>
                )}
                {listaProximosEventos.length > 0 && (
                    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                        <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">
                            Outros Próximos Eventos
                        </h4>
                        <ul className="space-y-2">
                            {listaProximosEventos.map((ev, index) => (
                                <li key={index} className="flex justify-between items-center text-sm text-gray-600 border-l-4 border-blue-200 pl-2">
                                    <span className="font-medium text-gray-800">
                                        {ev.titulo}{ev.adversario ? ` vs ${ev.adversario}` : ''}
                                    </span>
                                    <span>
                                        {ev.data} {ev.hora && `às ${ev.hora}`}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {!proximoEvento && listaProximosEventos.length === 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-center items-center text-gray-500">
                        <p className="italic">
                            📊 Gráficos de desempenho e status dos atletas em breve!
                        </p>
                    </div>
                )}

            </div>
          </div>
        </>
      )}
    </section>
  )
}

function Card({ title, value, color }) {
  return (
    <div
      className={`bg-white p-6 rounded-xl shadow border-t-4 border-${color}-500 hover:shadow-lg transition transform hover:-translate-y-1`}
    >
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
    </div>
  )
}

function ResumoItem({ label, value, color }) {
  return (
    <div className="flex justify-between border-b pb-2 mb-1">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-lg font-bold text-${color}-700`}>{value}</span>
    </div>
  )
}






