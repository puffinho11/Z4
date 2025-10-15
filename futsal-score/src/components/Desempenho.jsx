import React, { useEffect, useRef, useState } from "react"
import Chart from "chart.js/auto"
import api from "../api"


export default function Desempenho() {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const catChartRef = useRef(null)
  const atletaChartRef = useRef(null)
  const catInst = useRef(null)
  const atInst = useRef(null)

  async function fetchRegistros() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get("/registros")
      const data = Array.isArray(response.data) ? response.data : []
      
      setRegistros(data)
      montarChartCategoria(data)
      montarChartAtletas(data)
      
    } catch (err) {
      console.error("Erro ao carregar registros para Desempenho:", err.response || err)
      const msg = "Erro ao carregar dados. Verifique sua conexão e login."
      setError(msg)
      setRegistros([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistros();
  }, []) 

  function montarChartCategoria(regs) {
    const ctx = catChartRef.current?.getContext("2d")
    if (!ctx) return
    if (catInst.current) catInst.current.destroy()

    const byCat = {}

    regs.forEach((r) => {
      byCat[r.categoria] = byCat[r.categoria] || { vo2: 0, lesoes: 0, count: 0 }
      byCat[r.categoria].vo2 += Number(r.vo2 || 0)
      byCat[r.categoria].lesoes += Number(r.lesoes || 0)
      byCat[r.categoria].count += 1
    })

    const labels = Object.keys(byCat).filter(l => byCat[l].count > 0)
  
    const mediaVo2 = labels.map((l) => Math.round((byCat[l].vo2 / byCat[l].count) * 10) / 10 || 0)
    const mediaLesoes = labels.map((l) => Math.round((byCat[l].lesoes / byCat[l].count) * 10) / 10 || 0)

    catInst.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Média VO₂ Máximo",
            data: mediaVo2,
            backgroundColor: "rgba(54, 162, 235, 0.6)", 
            yAxisID: 'y',
          },
          {
            label: "Média de Lesões",
            data: mediaLesoes,
            backgroundColor: "rgba(255, 99, 132, 0.6)", 
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Média de Desempenho por Categoria',
          }
        },
        scales: {
           
            y: {
                type: 'linear',
                display: 'auto',
                position: 'left',
                title: { display: true, text: 'VO₂' }
            },
          
            y1: {
                type: 'linear',
                display: 'auto',
                position: 'right',
                grid: { drawOnChartArea: false }, 
                title: { display: true, text: 'Lesões' },
                min: 0
            }
        }
      },
    })
  }
  function montarChartAtletas(regs) {
    const ctx = atletaChartRef.current?.getContext("2d")
    if (!ctx) return
    if (atInst.current) atInst.current.destroy()

    const byAtleta = {}
    regs.forEach((r) => {
      byAtleta[r.nome] = byAtleta[r.nome] || { vo2: 0, count: 0 }
      byAtleta[r.nome].vo2 += Number(r.vo2 || 0)
      byAtleta[r.nome].count += 1
    })

    const labels = Object.keys(byAtleta).filter(l => byAtleta[l].count > 0).slice(0, 10)
    const data = labels.map((l) => Math.round((byAtleta[l].vo2 / byAtleta[l].count) * 10) / 10 || 0)
    const backgroundColors = data.map(val => val > 50 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 159, 64, 0.6)')

    atInst.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Média VO₂ Máximo",
            data: data,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(c => c.replace('0.6', '1')), 
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: `Média de VO₂ Máximo por Atleta (Top ${labels.length})`,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  }


  return (
    <section className="space-y-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold">Análise de Desempenho e Estatísticas</h2>
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      
      {loading && <div className="text-blue-600 p-4">Carregando dados para gráficos...</div>}

      {!loading && !error && (
        <div className="space-y-6">
            <div className="p-4 rounded-2xl shadow border">
                <h3 className="text-xl font-semibold mb-4">Gráficos de Comparação</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow border">
                    <canvas ref={catChartRef} height="220" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow border">
                    <canvas ref={atletaChartRef} height="220" />
                  </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
                <h3 className="font-semibold mb-2">Dados brutos do monitoramento ({registros.length} registros)</h3>
                <div className="text-sm text-gray-700 max-h-96 overflow-y-auto">
                {registros.length === 0 && <div className="text-gray-500">Nenhum registro encontrado.</div>}
                
                {registros.slice().reverse().map(r => (
                    <div key={r._id} className="border-b py-2 flex justify-between items-center">
                    <div>
                        <div className="font-medium">{r.nome} <span className="text-xs text-gray-500">({r.categoria})</span></div>
                        <div className="text-xs text-gray-500">
                            {new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR')} • Status: {r.status}
                        </div>
                    </div>
                    <div className="text-right space-x-3 text-sm">
                        <span className="text-blue-600">VO₂: {r.vo2}</span>
                        <span className="text-red-600">Lesões: {r.lesoes}</span>
                    </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
      )}

    </section>
  )
}

