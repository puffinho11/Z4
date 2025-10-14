import React, { useEffect, useRef, useState } from "react"
import Chart from "chart.js/auto"
import { getItem, LS_KEY } from "../utils/storage"


export default function Desempenho() {
  const [registros, setRegistros] = useState([])
  const catChartRef = useRef(null);
  const atletaChartRef = useRef(null)
  const catInst = useRef(null)
  const atInst = useRef(null)

  useEffect(() => {
    const regs = getItem(LS_KEY, [])
    setRegistros(regs)
    montarChartCategoria(regs)
    montarChartAtletas(regs)
  }, [])

  function montarChartCategoria(regs) {
    const ctx = catChartRef.current?.getContext("2d")
    if (!ctx) return
    if (catInst.current) catInst.current.destroy()

    const byCat = {}
    regs.forEach((r) => {
      byCat[r.categoria] = byCat[r.categoria] || { vo2: 0, count: 0 }
      byCat[r.categoria].vo2 += Number(r.vo2 || 0)
      byCat[r.categoria].count += 1
    })

    const labels = Object.keys(byCat)
    const data = labels.map((l) => Math.round((byCat[l].vo2 / byCat[l].count) * 10) / 10 || 0)

    catInst.current = new Chart(ctx, {
      type: "bar",
      data: { labels, datasets: [{ label: "VO₂ médio", data }] },
      options: { responsive: true, plugins: { title: { display: true, text: "VO₂ médio por categoria" } } },
    })
  }

  function montarChartAtletas(regs) {
    const ctx = atletaChartRef.current?.getContext("2d")
    if (!ctx) return
    if (atInst.current) atInst.current.destroy()

    const byAt = {}
    regs.forEach((r) => {
      byAt[r.nome] = byAt[r.nome] || { vo2Sum: 0, cnt: 0 }
      byAt[r.nome].vo2Sum += Number(r.vo2 || 0)
      byAt[r.nome].cnt += 1
    })

    const labels = Object.keys(byAt).slice(0, 10)
    const data = labels.map((l) => Math.round((byAt[l].vo2Sum / byAt[l].cnt) * 10) / 10 || 0)

    atInst.current = new Chart(ctx, {
      type: "line",
      data: { labels, datasets: [{ label: "VO₂ médio (top 10)", data }] },
      options: { responsive: true, plugins: { title: { display: true, text: "Top 10 atletas — VO₂ médio" } } },
    })
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Desempenho — Gráficos</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow">
            <canvas ref={catChartRef} height="220" />
          </div>
          <div className="bg-white p-4 rounded-2xl shadow">
            <canvas ref={atletaChartRef} height="220" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow">
        <h3 className="font-semibold mb-2">Dados brutos</h3>
        <div className="text-sm text-gray-700">
          {registros.length === 0 && <div className="text-gray-500">Nenhum registro.</div>}
          {registros.slice().reverse().map(r => (
            <div key={r.id} className="border-b py-2">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{r.nome} <span className="text-xs text-gray-500">({r.categoria})</span></div>
                  <div className="text-xs text-gray-500">{new Date(r.data+'T00:00:00').toLocaleDateString('pt-BR')}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">VO₂: {r.vo2}</div>
                  <div className="text-xs text-gray-500">Treinos/sem: {r.treinos}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

