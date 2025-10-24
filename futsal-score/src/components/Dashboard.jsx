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

  async function fetchEventos() {
    try {
      const { data } = await api.get("/calendario")
      setEventos(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Erro ao carregar eventos:", err)
    }
  }

  async function fetchRegistros() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get("/registros")
      setRegistros(Array.isArray(data) ? data : [])
      await fetchEventos()
    } catch (err) {
      console.error("Erro ao carregar registros:", err)
      setError("Erro ao carregar dados. Verifique o servidor ou login.")
      setRegistros([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistros()
  }, [])

  const atletasCount = [...new Set(registros.map(r => r.nome))].length
  const ultimos30 = registros.filter(r => {
    const d = new Date(r.data)
    const ago = new Date()
    ago.setDate(ago.getDate() - 30)
    return d >= ago
  }).length
  const emRecuperacao = registros.filter(
    r => r.status === "Recuperação" || r.status === "Lesão"
  ).length
  const totalLesoes = registros.reduce((s, r) => s + (+r.lesoes || 0), 0)
  const totalGols = registros.reduce((s, r) => s + (+r.gols || 0), 0)
  const totalAmarelos = registros.reduce((s, r) => s + (+r.amarelos || 0), 0)
  const totalVermelhos = registros.reduce((s, r) => s + (+r.vermelhos || 0), 0)

  const eventosFuturos = eventos
    .map(ev => {
      const dataString = ev.data.slice(0, 10)
      const [y, m, d] = dataString.split("-").map(Number)
      const [h, min] = (ev.hora || "00:00").split(":").map(Number)
      return { ...ev, dateTime: new Date(y, m - 1, d, h, min) }
    })
    .filter(ev => ev.dateTime.getTime() >= Date.now() - 60000)
    .sort((a, b) => a.dateTime - b.dateTime)

  const proximoEvento = eventosFuturos[0]
  const listaProximosEventos = eventosFuturos.slice(proximoEvento ? 1 : 0, 6)

  return (
    <section className="p-8 ml-64 min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-50">
      <h2 className="text-3xl font-bold mb-8 text-blue-800 flex items-center gap-2">
        <MdDashboard className="text-4xl" /> Painel de Gestão de Atletas
      </h2>

      {loading && <p className="text-blue-600 animate-pulse">Carregando...</p>}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 shadow">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ResumoCard title="Atletas" value={atletasCount} color="blue" icon={MdGroup} />
            <ResumoCard title="Últimos 30 dias" value={ultimos30} color="purple" icon={MdUpdate} />
            <ResumoCard title="Em Recuperação" value={emRecuperacao} color="red" icon={MdOutlineHealing} />
          </div>

          {/* Eventos */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ResumoOcorrencias {...{ totalLesoes, totalGols, totalAmarelos, totalVermelhos }} />
            <Eventos proximoEvento={proximoEvento} listaProximosEventos={listaProximosEventos} />
          </div>
        </>
      )}
    </section>
  )
}

function ResumoCard({ title, value, color, icon: Icon }) {
  return (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 border-t-4 border-${color}-400 p-6 rounded-xl shadow flex items-center gap-4`}>
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

function ResumoOcorrencias({ totalLesoes, totalGols, totalAmarelos, totalVermelhos }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2 border-b pb-2">
        <MdSportsSoccer className="text-xl" /> Resumo de Ocorrências
      </h3>
      <ResumoItem label="Lesões" value={totalLesoes} color="red" icon={MdOutlineHealing} />
      <ResumoItem label="Gols" value={totalGols} color="green" icon={MdSportsSoccer} />
      <ResumoItem label="Amarelos" value={totalAmarelos} color="yellow" icon={MdOutlineStyle} />
      <ResumoItem label="Vermelhos" value={totalVermelhos} color="red" icon={MdOutlineStyle} />
    </div>
  )
}

function ResumoItem({ label, value, color, icon: Icon }) {
  return (
    <div className="flex justify-between border-b pb-2 mb-2 items-center">
      <span className="text-sm text-gray-600 flex items-center gap-2">
        <Icon className={`text-${color}-600`} /> {label}
      </span>
      <span className={`text-xl font-bold text-${color}-700`}>{value}</span>
    </div>
  )
}

function Eventos({ proximoEvento, listaProximosEventos }) {
  return (
    <div className="lg:col-span-2 space-y-4">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <MdOutlineEvent className="text-2xl text-blue-700" /> Próximo Evento
      </h3>
      {proximoEvento ? (
        <Countdown
          targetDate={proximoEvento.dateTime.toISOString()}
          eventTitle={`${proximoEvento.titulo}${proximoEvento.adversario ? ` vs ${proximoEvento.adversario}` : ""}`}
          eventLocal={proximoEvento.local}
        />
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md text-gray-500 border border-gray-100 flex flex-col items-center">
          <p className="italic font-semibold">🗓️ Nenhum evento futuro.</p>
        </div>
      )}
      {listaProximosEventos.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
          <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2 flex items-center gap-2">
            <MdOutlineEvent className="text-lg" /> Outros Eventos
          </h4>
          <ul className="space-y-2">
            {listaProximosEventos.map((ev, i) => (
              <li key={i} className="flex justify-between items-center text-sm text-gray-600 border-l-4 border-blue-200 pl-2 py-1">
                <span className="font-medium text-gray-800">
                  {ev.titulo} {ev.adversario ? `vs ${ev.adversario}` : ""}
                </span>
                <span className="text-xs text-gray-500">
                  {ev.dateTime.toLocaleDateString("pt-BR")} {ev.hora && `às ${ev.hora}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
