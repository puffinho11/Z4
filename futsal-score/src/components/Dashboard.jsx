import React, { useEffect, useState } from "react"
import api from "../api"
import Countdown from "./Countdown"
import {
  MdDashboard,
  MdGroup,
  MdUpdate,
  MdOutlineHealing,
  MdSportsSoccer,
  MdOutlineStyle,
  MdOutlineEvent
} from "react-icons/md"

export default function Dashboard() {
  const [registros, setRegistros] = useState([])
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const Card = ({ title, value, color, icon: Icon, className = "" }) => {
    const bgColors = {
      blue: "from-blue-50 to-blue-100 border-blue-400",
      purple: "from-purple-50 to-purple-100 border-purple-400",
      red: "from-red-50 to-red-100 border-red-400",
      green: "from-green-50 to-green-100 border-green-400",
      yellow: "from-yellow-50 to-yellow-100 border-yellow-400",
      indigo: "from-indigo-50 to-indigo-100 border-indigo-400",
      gray: "from-gray-50 to-gray-100 border-gray-300",
    }

    return (
      <div
        className={`bg-gradient-to-br ${bgColors[color] || bgColors.gray} p-6 rounded-xl shadow-md hover:shadow-lg border-t-4 transition-transform hover:-translate-y-1 flex items-center gap-4 ${className}`}
      >
        <div className={`text-4xl p-3 rounded-full bg-white/70 text-${color}-600 shadow-sm`}>
          <Icon />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
    )
  }

  const ResumoItem = ({ label, value, color, icon: Icon }) => {
    return (
      <div className="flex justify-between border-b pb-2 mb-2 items-center">
        <span className="text-sm text-gray-600 flex items-center gap-2">
          <Icon className={`text-${color}-600`} />
          {label}
        </span>
        <span className={`text-xl font-bold text-${color}-700`}>{value}</span>
      </div>
    )
  }

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
  }, [])

  const atletasCount = [...new Set(registros.map((r) => r.nome))].length

  const ultimos30 = registros.filter((r) => {
    const d = new Date(r.data)
    const ago = new Date()
    ago.setDate(ago.getDate() - 30)
    return d >= ago
  }).length

  const emRecuperacao = registros.filter(
    (r) => r.status === "Recuperação" || r.status === "Lesão"
  ).length

  const totalLesoes = registros.reduce((sum, r) => sum + (Number(r.lesoes) || 0), 0)
  const totalGols = registros.reduce((sum, r) => sum + (Number(r.gols) || 0), 0)
  const totalAmarelos = registros.reduce((sum, r) => sum + (Number(r.amarelos) || 0), 0)
  const totalVermelhos = registros.reduce((sum, r) => sum + (Number(r.vermelhos) || 0), 0)

  const eventosFuturos = eventos
    .map((ev) => {
      const dataString = ev.data.slice(0, 10)
      const [year, month, day] = dataString.split("-").map(Number)
      const [hour, minute] = (ev.hora || "00:00").split(":").map(Number)
      const dateTime = new Date(year, month - 1, day, hour, minute)
      return { ...ev, dateTime }
    })
    .filter((ev) => ev.dateTime.getTime() >= new Date().getTime() - 60000)
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())

  const proximoEvento = eventosFuturos[0]
  const listaProximosEventos = eventosFuturos.slice(
    proximoEvento ? 1 : 0,
    proximoEvento ? 6 : 5
  )

  return (
    <section className="p-8 ml-64 min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-50">
      <h2 className="text-3xl font-bold mb-8 text-blue-800 flex items-center gap-2">
        <MdDashboard className="text-4xl" /> Painel de Gestão de Atletas
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
            <Card
              title="Atletas Registrados"
              value={atletasCount}
              color="blue"
              icon={MdGroup}
            />
            <Card
              title="Últimos Registros (30D)"
              value={ultimos30}
              color="purple"
              icon={MdUpdate}
            />
            <Card
              title="Em Recuperação"
              value={emRecuperacao}
              color="red"
              icon={MdOutlineHealing}
            />
          </div>
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-1 border border-gray-100">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2 border-b pb-2">
                <MdSportsSoccer className="text-xl" /> Resumo de Ocorrências
              </h3>
              <ResumoItem
                label="Lesões"
                value={totalLesoes}
                color="red"
                icon={MdOutlineHealing}
              />
              <ResumoItem
                label="Gols Marcados"
                value={totalGols}
                color="green"
                icon={MdSportsSoccer}
              />
              <ResumoItem
                label="Cartões Amarelos"
                value={totalAmarelos}
                color="yellow"
                icon={MdOutlineStyle}
              />
              <ResumoItem
                label="Cartões Vermelhos"
                value={totalVermelhos}
                color="red"
                icon={MdOutlineStyle}
              />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MdOutlineEvent className="text-2xl text-blue-700" /> Próximo Evento
              </h3>

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
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-center items-center text-gray-500 border border-gray-100">
                  <p className="italic font-semibold">
                    🗓️ Nenhum evento futuro no calendário.
                  </p>
                  <p className="text-sm mt-1">
                    Adicione um novo em "Calendário".
                  </p>
                </div>
              )}

              {listaProximosEventos.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                  <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2 flex items-center gap-2">
                    <MdOutlineEvent className="text-lg" /> Outros Eventos
                  </h4>
                  <ul className="space-y-2">
                    {listaProximosEventos.map((ev, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center text-sm text-gray-600 border-l-4 border-blue-200 pl-2 py-1"
                      >
                        <span className="font-medium text-gray-800">
                          {ev.titulo}
                          {ev.adversario ? ` vs ${ev.adversario}` : ""}
                        </span>
                        <span className="text-xs text-gray-500">
                          {ev.dateTime.toLocaleDateString("pt-BR")}{" "}
                          {ev.hora && `às ${ev.hora}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  )
}









