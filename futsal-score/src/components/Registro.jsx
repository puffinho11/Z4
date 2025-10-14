import React, { useEffect, useState } from "react";
import { getItem, setItem, LS_KEY } from "../utils/storage";

export default function Registro() {
  const blank = {
    nome: "",
    categoria: "",
    status: "OK",
    treinos: 3,
    lesoes: 0,
    vo2: 50,
    data: new Date().toISOString().slice(0, 10),
    gols: 0,
    amarelos: 0,
    vermelhos: 0,
  }

  const [form, setForm] = useState(blank)
  const [editingId, setEditingId] = useState(null)
  const [lista, setLista] = useState([])

  useEffect(() => {
    setLista(getItem(LS_KEY, []))
  }, [])

  function handleChange(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome || !form.categoria) {
      alert("Preencha nome e categoria")
      return
    }
    const regs = getItem(LS_KEY, [])
    if (editingId) {
      const idx = regs.findIndex((r) => r.id === editingId)
      if (idx !== -1) {
        regs[idx] = { ...regs[idx], ...form }
        setItem(LS_KEY, regs)
        setLista(regs)
        setEditingId(null)
        setForm(blank)
        return
      }
    }
    const novo = { id: Date.now() + "-" + Math.random().toString(36).slice(2, 6), ...form }
    regs.push(novo)
    setItem(LS_KEY, regs)
    setLista(regs)
    setForm(blank)
  }

  function editar(r) {
    setEditingId(r.id)
    setForm({
      nome: r.nome,
      categoria: r.categoria,
      status: r.status,
      treinos: r.treinos,
      lesoes: r.lesoes,
      vo2: r.vo2,
      data: r.data,
      gols: r.gols || 0,
      amarelos: r.amarelos || 0,
      vermelhos: r.vermelhos || 0,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function excluir(id) {
    if (!confirm("Excluir registro?")) return
    const regs = getItem(LS_KEY, []).filter((r) => r.id !== id)
    setItem(LS_KEY, regs)
    setLista(regs)
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Registrar Monitoramento</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Nome do atleta</label>
          <input
            value={form.nome}
            onChange={(e) => handleChange("nome", e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Categoria</label>
            <select
              value={form.categoria}
              onChange={(e) => handleChange("categoria", e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Selecione</option>
              <option>Sub-11</option>
              <option>Sub-13</option>
              <option>Sub-15</option>
              <option>Sub-17</option>
              <option>Adulto</option>
              <option>Feminino</option>
            </select>
          </div>

          <div>
            <label className="block text-sm">Status</label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option>OK</option>
              <option>Recuperação</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm">Treinos / semana</label>
            <input
              type="number"
              value={form.treinos}
              onChange={(e) => handleChange("treinos", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm">Lesões</label>
            <input
              type="number"
              value={form.lesoes}
              onChange={(e) => handleChange("lesoes", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm">VO₂</label>
            <input
              type="number"
              value={form.vo2}
              onChange={(e) => handleChange("vo2", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm">Gols</label>
            <input
              type="number"
              value={form.gols}
              onChange={(e) => handleChange("gols", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm">Amarelos</label>
            <input
              type="number"
              value={form.amarelos}
              onChange={(e) => handleChange("amarelos", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm">Vermelhos</label>
            <input
              type="number"
              value={form.vermelhos}
              onChange={(e) => handleChange("vermelhos", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm">Data</label>
          <input
            type="date"
            value={form.data}
            onChange={(e) => handleChange("data", e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            {editingId ? "Atualizar" : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(blank);
              setEditingId(null);
            }}
            className="px-3 py-2 rounded-lg border"
          >
            Limpar
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Registros</h3>
        <div className="space-y-2">
          {lista.length === 0 && (
            <div className="text-gray-500">Nenhum registro encontrado.</div>
          )}
          {lista
            .slice()
            .reverse()
            .map((r) => (
              <div key={r.id} className="p-3 border rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-medium">{r.nome}</div>
                  <div className="text-xs text-gray-500">
                    {r.categoria} • {new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => editar(r)} className="text-blue-600 hover:underline text-sm">Editar</button>
                  <button onClick={() => excluir(r.id)} className="text-red-600 hover:underline text-sm">Excluir</button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

