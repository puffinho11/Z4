import React, { useEffect, useState } from 'react'
import { getItem } from '../utils/storage'
import '../index.css'

export default function Dashboard(){
  const [registros, setRegistros] = useState([])

  useEffect(()=> setRegistros(getItem('monitoramento_atletas_v1', [])), [])

  const atletas = [...new Set(registros.map(r => r.nome))].length

  return (
    <section id="dashboard">
      <div className="bg-white rounded-2xl shadow overflow-hidden fade-in-up p-4">
        <div className="grid md:grid-cols-5">
          <div className="p-6 md:col-span-2 bg-blue-50">
            <h2 className="text-xl font-semibold mb-1">Equipe: ACAAF </h2>
            <p className="text-blue-800">Monitoramento físico e desempenho em campeonato (futsal).</p>
          </div>
          <div className="relative md:col-span-3">
            <div className="relative h-64 md:h-full bg-black" id="carousel"> {/* implementar carousel se quiser */} </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow flex items-center gap-2 fade-in-up mt-4">
        <span className="text-sm text-gray-600">Período:</span>
        <select className="border rounded-lg px-3 py-2">
          <option>Últimos 30 dias</option>
        </select>
        <span className="text-xs text-gray-400 ml-auto">Δ compara com período anterior</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        <div className="bg-white rounded-2xl shadow p-5 text-center fade-in-up tooltip">
          <p className="text-xs text-gray-500">Atletas</p>
          <h2 className="text-3xl font-bold mt-2">{atletas}</h2>
        </div>
      </div>
    </section>
  )
}
