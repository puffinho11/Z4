import React, { useEffect, useState } from "react"
import api from "../api"
import Countdown from "./Countdown"
import {
  MdGroup,
  MdUpdate,
  MdOutlineHealing,
  MdSportsSoccer,
  MdOutlineStyle,
  MdOutlineEvent,
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

  const totalLesoes = registros.reduce((s, r) => s + (+r.lesoes || 0), 0)
  const totalGols = registros.reduce((s, r) => s + (+r.gols || 0), 0)
  const totalAmarelos = registros.reduce((s, r) => s + (+r.amarelos || 0), 0)
  const totalVermelhos = registros.reduce((s, r) => s + (+r.vermelhos || 0), 0)

  const eventosFuturos = eventos
    .map((ev) => {
      const dataString = ev.data.slice(0, 10)
      const [y, m, d] = dataString.split("-").map(Number)
      const [h, min] = (ev.hora || "00:00").split(":").map(Number)
      return { ...ev, dateTime: new Date(y, m - 1, d, h, min) }
    })
    .filter((ev) => ev.dateTime.getTime() >= Date.now() - 60000)
    .sort((a, b) => a.dateTime - b.dateTime)

  const proximoEvento = eventosFuturos[0]
  const listaProximosEventos = eventosFuturos.slice(proximoEvento ? 1 : 0, 6)

  return (
    <section className="p-4 sm:p-6 lg:p-8 ml-0 lg:ml-64 min-h-screen bg-slate-50">
      {loading && <p className="text-emerald-600 animate-pulse">Carregando...</p>}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 shadow">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ResumoCard
              title="Atletas"
              value={atletasCount}
              gradient="from-emerald-500 to-emerald-600"
              icon={MdGroup}
            />
            <ResumoCard
              title="Últimos 30 dias"
              value={ultimos30}
              gradient="from-emerald-400 to-emerald-500"
              icon={MdUpdate}
            />
            <ResumoCard
              title="Em Recuperação"
              value={emRecuperacao}
              gradient="from-rose-500 to-red-600"
              icon={MdOutlineHealing}
            />
          </div>

          {/* ✅ TIRADO o apóstrofo que deixava o grid torto */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ResumoOcorrencias
              {...{ totalLesoes, totalGols, totalAmarelos, totalVermelhos }}
            />
            <Eventos
              proximoEvento={proximoEvento}
              listaProximosEventos={listaProximosEventos}
            />
          </div>
        </>
      )}
    </section>
  )
}

function ResumoCard({ title, value, icon: Icon, gradient }) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} text-white p-6 rounded-2xl shadow-lg flex items-center gap-4 transform transition hover:scale-[1.03] hover:shadow-2xl`}
    >
      <div className="text-4xl p-3 rounded-full bg-white/20 backdrop-blur-sm shadow-md">
        <Icon />
      </div>
      <div>
        <p className="text-sm font-medium opacity-90">{title}</p>
        <p className="text-3xl font-extrabold drop-shadow-sm">{value}</p>
      </div>
    </div>
  )
}

function ResumoOcorrencias({
  totalLesoes,
  totalGols,
  totalAmarelos,
  totalVermelhos,
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition">
      <h3 className="text-lg font-bold mb-4 text-emerald-800 flex items-center gap-2 border-b border-slate-200 pb-3">
        <MdSportsSoccer className="text-xl text-emerald-600" /> Resumo Geral
      </h3>

      <div className="space-y-2">
        <ResumoItem label="Lesões" value={totalLesoes} tone="red" icon={MdOutlineHealing} />
        <ResumoItem label="Gols" value={totalGols} tone="emerald" icon={MdSportsSoccer} />
        <ResumoItem
          label="Cartões Amarelos"
          value={totalAmarelos}
          tone="yellow"
          icon={MdOutlineStyle}
        />
        <ResumoItem
          label="Cartões Vermelhos"
          value={totalVermelhos}
          tone="red"
          icon={MdOutlineStyle}
          noBorder
        />
      </div>
    </div>
  )
}

/**
 * ✅ sem classes dinâmicas do tailwind (text-${color}-600)
 * porque isso quebra no build
 */
function ResumoItem({ label, value, tone = "emerald", icon: Icon, noBorder = false }) {
  const toneStyles = {
    red: { icon: "text-red-600", value: "text-red-700", badge: "bg-red-50 border-red-200" },
    emerald: { icon: "text-emerald-600", value: "text-emerald-700", badge: "bg-emerald-50 border-emerald-200" },
    yellow: { icon: "text-yellow-600", value: "text-yellow-700", badge: "bg-yellow-50 border-yellow-200" },
  }

  const t = toneStyles[tone] || toneStyles.emerald

  return (
    <div
      className={`flex items-center justify-between py-2 ${
        noBorder ? "" : "border-b border-slate-100"
      }`}
    >
      <span className="text-sm text-slate-600 flex items-center gap-2">
        <Icon className={`${t.icon} text-lg`} />
        {label}
      </span>

      <span className={`text-lg font-extrabold ${t.value} border ${t.badge} px-3 py-1 rounded-full`}>
        {value}
      </span>
    </div>
  )
}

function Eventos({ proximoEvento, listaProximosEventos }) {
  return (
    <div className="lg:col-span-2 space-y-4">
      <h3 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
        <MdOutlineEvent className="text-2xl text-emerald-700" /> Próximos Eventos
      </h3>

      {proximoEvento ? (
        <Countdown
          targetDate={proximoEvento.dateTime.toISOString()}
          eventTitle={`${proximoEvento.titulo}${
            proximoEvento.adversario ? ` vs ${proximoEvento.adversario}` : ""
          }`}
          eventLocal={proximoEvento.local}
        />
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-md text-slate-500 border border-slate-200 flex flex-col items-center">
          <p className="italic font-semibold">Nenhum evento futuro</p>
        </div>
      )}

      {listaProximosEventos.length > 0 && (
        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200">
          <h4 className="text-md font-semibold text-emerald-700 mb-3 border-b border-slate-200 pb-2 flex items-center gap-2">
            <MdOutlineEvent className="text-lg" /> Outros Eventos
          </h4>

          <ul className="space-y-2">
            {listaProximosEventos.map((ev, i) => (
              <li
                key={i}
                className="flex justify-between items-center text-sm text-slate-600 border-l-4 border-emerald-200 pl-2 py-1"
              >
                <span className="font-medium text-slate-800">
                  {ev.titulo} {ev.adversario ? `vs ${ev.adversario}` : ""}
                </span>
                <span className="text-xs text-slate-500">
                  {ev.dateTime.toLocaleDateString("pt-BR")}{" "}
                  {ev.hora && `às ${ev.hora}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}









