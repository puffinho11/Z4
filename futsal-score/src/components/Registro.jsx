import React, { useEffect, useState } from 'react'
import { getItem, setItem, LS_KEY } from '../utils/storage'
import '../index.css'

export default function Registro(){
  const [form, setForm] = useState({
    nome:'', categoria:'', status:'OK', treinos:3, lesoes:0, vo2:50,
    data: new Date().toISOString().slice(0,10), gols:0, amarelos:0, vermelhos:0
  })
  const [editingId, setEditingId] = useState(null)
  const [msgSaved, setMsgSaved] = useState(false)

  useEffect(()=> {
    // preencher data hoje
    setForm(prev=> ({...prev, data: new Date().toISOString().slice(0,10)}))
  },[])

  function handleChange(e){
    const { id, value } = e.target
    setForm(prev => ({ ...prev, [id.replace('input','').toLowerCase()]: value }))
  }

  function handleSubmit(e){
    e.preventDefault()
    const nome = form.nome.trim()
    if(!nome || !form.categoria || !form.data){ alert('Preencha nome, categoria e data'); return }
    const regs = getItem(LS_KEY, [])
    if(editingId){
      const idx = regs.findIndex(r => r.id === editingId)
      if(idx !== -1){
        regs[idx] = { id: editingId, ...form }
        setItem(LS_KEY, regs)
        alert('Registro atualizado!')
      }
      setEditingId(null)
    } else {
      regs.push({ id: Date.now() + '-' + Math.random().toString(36).slice(2,8), ...form })
      setItem(LS_KEY, regs)
      setMsgSaved(true)
      setTimeout(()=> setMsgSaved(false), 1200)
    }
    setForm({
      nome:'', categoria:'', status:'OK', treinos:3, lesoes:0, vo2:50,
      data: new Date().toISOString().slice(0,10), gols:0, amarelos:0, vermelhos:0
    })
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow max-w-2xl mx-auto fade-in-up">
      <h2 className="text-xl font-semibold mb-4">Registrar Monitoramento</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome do atleta</label>
          <input id="nome" value={form.nome} onChange={(e)=>setForm({...form, nome:e.target.value})} type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Ex: João Silva" required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Categoria</label>
            <select id="categoria" value={form.categoria} onChange={(e)=>setForm({...form, categoria:e.target.value})} className="w-full border rounded-lg px-3 py-2" required>
              <option value="">Selecione</option>
              <option>Sub-11</option><option>Sub-13</option><option>SUB-15</option><option>SUB-17</option><option>Feminino</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select id="status" value={form.status} onChange={(e)=>setForm({...form, status:e.target.value})} className="w-full border rounded-lg px-3 py-2" required>
              <option>OK</option>
              <option>Recuperação</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Treinos / semana</label>
            <input id="treinos" value={form.treinos} onChange={(e)=>setForm({...form, treinos:Number(e.target.value)})} type="number" min="0" className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Lesões (esta monit.)</label>
            <input id="lesoes" value={form.lesoes} onChange={(e)=>setForm({...form, lesoes:Number(e.target.value)})} type="number" min="0" className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">VO₂ (índice)</label>
            <input id="vo2" value={form.vo2} onChange={(e)=>setForm({...form, vo2:Number(e.target.value)})} type="number" min="0" className="w-full border rounded-lg px-3 py-2" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Gols no campeonato</label>
            <input id="gols" value={form.gols} onChange={(e)=>setForm({...form, gols:Number(e.target.value)})} type="number" min="0" className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Cartões amarelos</label>
            <input id="amarelos" value={form.amarelos} onChange={(e)=>setForm({...form, amarelos:Number(e.target.value)})} type="number" min="0" className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Cartões vermelhos</label>
            <input id="vermelhos" value={form.vermelhos} onChange={(e)=>setForm({...form, vermelhos:Number(e.target.value)})} type="number" min="0" className="w-full border rounded-lg px-3 py-2" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Data do monitoramento</label>
          <input id="data" value={form.data} onChange={(e)=>setForm({...form, data: e.target.value})} type="date" className="w-full border rounded-lg px-3 py-2" required />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{editingId ? 'Atualizar registro' : 'Salvar registro'}</button>
          <button type="button" onClick={()=>setForm(prev=>({...prev, data:new Date().toISOString().slice(0,10)}))} className="text-sm px-3 py-2 rounded-lg border">Hoje</button>
          {msgSaved && <span className="text-sm text-green-600">Salvo ✓</span>}
        </div>
      </form>
    </div>
  )
}
