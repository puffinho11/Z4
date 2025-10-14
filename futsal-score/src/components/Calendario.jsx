import React, { useEffect, useState } from "react"
import { getItem, setItem } from "../utils/storage"

const CAL_KEY = "sfinge_calendario_v1"

export default function Calendario() {
  const [lista, setLista] = useState([])
  const [form, setForm] = useState({
    titulo: "",
    adversario: "",
    data: new Date().toISOString().slice(0, 10),
    hora: "18:00",
    local: "",
  })

  useEffect(() => {
    setLista(getItem(CAL_KEY, []))
  }, [])

  function handleChange(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function salvar(e) {
    e?.preventDefault()
    if (!form.titulo || !form.data) {
      alert("Preencha título e data")
      return
    }
    const arr = getItem(CAL_KEY, [])
    const novo = { id: Date.now() + "-" + Math.random().toString(36).slice(2,6), ...form }
    arr.push(novo)
    setItem(CAL_KEY, arr)
    setLista(arr)
    setForm({ titulo: "", adversario: "", data: new Date().toISOString().slice(0,10), hora: "18:00", local: "" })
  }

  function excluir(id) {
    if (!confirm("Excluir evento?")) return
    const arr = getItem(CAL_KEY, []).filter((i) => i.id !== id)
    setItem(CAL_KEY, arr)
    setLista(arr)
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Calendário de Jogos</h2>

      <form onSubmit={salvar} className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-sm">Título</label>
          <input value={form.titulo} onChange={(e)=>handleChange("titulo", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Adversário</label>
            <input value={form.adversario} onChange={(e)=>handleChange("adversario", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm">Local</label>
            <input value={form.local} onChange={(e)=>handleChange("local", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Data</label>
            <input type="date" value={form.data} onChange={(e)=>handleChange("data", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm">Hora</label>
            <input type="time" value={form.hora} onChange={(e)=>handleChange("hora", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>

        <div className="flex gap-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Salvar evento</button>
          <button type="button" onClick={()=>setForm({ titulo: "", adversario: "", data: new Date().toISOString().slice(0,10), hora:"18:00", local:"" })} className="px-3 py-2 border rounded-lg">Limpar</button>
        </div>
      </form>

      <div>
        <h3 className="font-semibold mb-2">Próximos jogos</h3>
        {lista.length === 0 && <div className="text-gray-500">Nenhum evento cadastrado.</div>}
        <div className="space-y-2">
          {lista.slice().sort((a,b)=> new Date(a.data) - new Date(b.data)).map(ev => (
            <div key={ev.id} className="border p-3 rounded-lg flex justify-between items-center">
              <div>
                <div className="font-medium">{ev.titulo} <span className="text-xs text-gray-500">• {ev.adversario}</span></div>
                <div className="text-xs text-gray-500">{new Date(ev.data+'T'+(ev.hora||'00:00')).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} {ev.local? '• ' + ev.local : ''}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={()=>{ navigator.clipboard?.writeText(`${ev.titulo} - ${ev.adversario} • ${ev.data} ${ev.hora}`); alert('Copiado para área de transferência') }} className="text-sm text-gray-600 hover:underline">Copiar</button>
                <button onClick={()=>excluir(ev.id)} className="text-sm text-red-600 hover:underline">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
