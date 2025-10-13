import React, { useEffect, useRef, useState } from 'react'
import Chart from 'chart.js/auto'
import { getItem, setItem, LS_KEY } from '../utils/storage'
import * as XLSX from 'xlsx'
import '../index.css' 

export default function Relatorio(){
  const [registros, setRegistros] = useState(getItem(LS_KEY, []))
  const [filtroCat, setFiltroCat] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [selAtleta, setSelAtleta] = useState('')
  const [metrica, setMetrica] = useState('vo2')
  const chartRef = useRef(null)
  const chartInst = useRef(null)

  useEffect(()=> setRegistros(getItem(LS_KEY, [])), [])

  function aplicarFiltros(){ setRegistros(getItem(LS_KEY, []).filter(r=>{
    if(filtroCat && r.categoria !== filtroCat) return false
    if(filtroStatus && r.status !== filtroStatus) return false
    return true
  })) }

  function limparFiltros(){ setFiltroCat(''); setFiltroStatus(''); setRegistros(getItem(LS_KEY, [])) }

  function exportExcel(){
    const data = getItem(LS_KEY, []).map(r=>{
      return {
        Nome: r.nome, Categoria: r.categoria, Data: r.data, Status: r.status,
        Treinos_Semana: r.treinos, Lesoes: r.lesoes, VO2: r.vo2, Gols: r.gols||0,
        Cartoes_Amarelos: r.amarelos||0, Cartoes_Vermelhos: r.vermelhos||0
      }
    })
    if(!data.length){ alert('Nenhum dado para exportar.'); return }
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Monitoramento')
    XLSX.writeFile(wb, `monitoramento_sfinge_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  function atualizarGrafico(){
    const regs = getItem(LS_KEY, []).filter(r=> r.nome === selAtleta).sort((a,b)=> new Date(a.data)-new Date(b.data))
    const ctx = chartRef.current.getContext('2d')
    if(chartInst.current) chartInst.current.destroy()
    if(!regs.length || !selAtleta){
      chartInst.current = new Chart(ctx, { type: 'line', data:{labels:[], datasets:[]}, options:{plugins:{title:{display:true,text:'Sem dados'}}} })
      return
    }
    const labels = regs.map(r => {
      const d = new Date(r.data + 'T00:00:00')
      return d.toLocaleDateString('pt-BR')
    })
    const data = regs.map(r => Number(r[metrica] || 0))
    chartInst.current = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ label: metrica.toUpperCase(), data, fill: true, borderWidth:2, tension:0.25, pointRadius:4 }] },
      options: { responsive:true, plugins:{title:{display:true, text:`Evolução — ${selAtleta}`}} }
    })
  }

  const categorias = [...new Set(getItem(LS_KEY, []).map(r=>r.categoria))].sort()
  const atletas = [...new Set(getItem(LS_KEY, []).map(r=>r.nome))].sort()

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm">Filtrar por categoria:</label>
            <select value={filtroCat} onChange={(e)=>setFiltroCat(e.target.value)} className="border rounded-lg px-3 py-2">
              <option value="">Todas</option>
              {categorias.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="text-sm ml-3">Status:</label>
            <select value={filtroStatus} onChange={(e)=>setFiltroStatus(e.target.value)} className="border rounded-lg px-3 py-2">
              <option value="">Todas</option><option>OK</option><option>Recuperação</option>
            </select>
            <button onClick={aplicarFiltros} className="ml-3 bg-gray-100 px-3 py-2 rounded-lg">Aplicar</button>
            <button onClick={limparFiltros} className="ml-2 text-sm text-gray-600 hover:underline">Limpar filtros</button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportExcel} className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700">Exportar Excel</button>
            <label className="text-sm">Gráfico (métrica):</label>
            <select value={selAtleta} onChange={(e)=>setSelAtleta(e.target.value)} className="border rounded-lg px-3 py-2">
              <option value="">Selecione um atleta</option>
              {atletas.map(a=> <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={metrica} onChange={e=>setMetrica(e.target.value)} className="border rounded-lg px-3 py-2">
              <option value="vo2">VO₂</option>
              <option value="treinos">Treinos</option>
              <option value="lesoes">Lesões</option>
              <option value="gols">Gols</option>
              <option value="amarelos">Cartões Amarelos</option>
              <option value="vermelhos">Cartões Vermelhos</option>
            </select>
            <button onClick={atualizarGrafico} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">Atualizar gráfico</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow overflow-auto">
          <h3 className="font-semibold mb-3">Tabela de registros</h3>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Nome</th><th className="px-3 py-2 text-left">Categoria</th><th className="px-3 py-2 text-left">Data</th>
                <th className="px-3 py-2 text-center">Treinos/sem</th><th className="px-3 py-2 text-center">Lesões</th><th className="px-3 py-2 text-center">VO₂</th>
                <th className="px-3 py-2 text-center">Gols</th><th className="px-3 py-2 text-center">Amarelos</th><th className="px-3 py-2 text-center">Vermelhos</th>
                <th className="px-3 py-2 text-center">Status</th><th className="px-3 py-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registros.length === 0 && <tr><td colSpan="11" className="px-3 py-4 text-center text-gray-500">Nenhum registro</td></tr>}
              {registros.sort((a,b)=> new Date(b.data) - new Date(a.data)).map(r => (
                <tr key={r.id}>
                  <td className="px-3 py-2">{r.nome}</td>
                  <td className="px-3 py-2">{r.categoria}</td>
                  <td className="px-3 py-2">{new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-3 py-2 text-center">{r.treinos}</td>
                  <td className="px-3 py-2 text-center">{r.lesoes}</td>
                  <td className="px-3 py-2 text-center">{r.vo2}</td>
                  <td className="px-3 py-2 text-center">{r.gols || 0}</td>
                  <td className="px-3 py-2 text-center">{r.amarelos || 0}</td>
                  <td className="px-3 py-2 text-center">{r.vermelhos || 0}</td>
                  <td className="px-3 py-2 text-center"><span className={`px-2 py-1 rounded-full text-sm ${r.status==='OK'?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}`}>{r.status}</span></td>
                  <td className="px-3 py-2 text-center">
                    <button className="text-blue-600 hover:underline mr-2">Editar</button>
                    <button className="text-red-600 hover:underline">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <h3 className="font-semibold mb-3">Gráfico</h3>
          <canvas ref={chartRef} height="260"></canvas>
          <p className="text-xs text-gray-500 mt-2">Selecione um atleta e uma métrica e clique em “Atualizar gráfico”.</p>
        </div>
      </div>
    </div>
  )
}
