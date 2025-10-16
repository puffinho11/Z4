import React, { useEffect, useState } from "react"
import api from "../api"

export default function Exames() {
  const blank = {
    atleta: "",
    tipo: "Avaliação Física",
    resultado: "",
    data: new Date().toISOString().slice(0, 10),
    obs: "",
  }

  const [lista, setLista] = useState([])
  const [editingId, setEditingId] = useState(null) 
  const [form, setForm] = useState(blank)
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchExames() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get("/exames")
      setLista(response.data);
    } catch (err) {
      console.error("Erro ao carregar exames:", err.response || err)
      const msg = err.response?.status === 403 || err.response?.status === 401 
        ? "Acesso negado. Faça login novamente."
        : "Erro ao carregar dados do servidor. Verifique o console."
      setError(msg)
      setLista([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExames()
  }, [])

  function handleChange(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function handleCancel() {
    setForm(blank)
    setEditingId(null)
  }

  function editar(exame) {
    setForm(exame)
    setEditingId(exame._id)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = { 
        ...form, 
        id: editingId 
    }

    try {
        const response = await api.post("/exames", payload)
        
        if (editingId) {
            setLista(lista.map(ex => ex._id === editingId ? response.data : ex));
        } else {
            setLista([response.data, ...lista]);
        }

        handleCancel()
        alert(editingId ? "Exame atualizado com sucesso!" : "Exame salvo com sucesso!")
    } catch (err) {
      console.error("Erro ao salvar exame:", err.response || err)
      setError("Erro ao salvar exame. Verifique o console ou a conexão com a API.")
    } finally {
      setLoading(false)
    }
  }

  async function excluir(id) {
    if (!window.confirm("Tem certeza que deseja excluir este exame?")) return

    setLoading(true)
    setError(null)

    try {
        await api.delete(`/exames/${id}`)
        setLista(lista.filter(ex => ex._id !== id))
        alert("Exame excluído com sucesso!")
    } catch (err) {
        console.error("Erro ao excluir exame:", err.response || err)
        setError("Erro ao excluir exame. Verifique o console.")
    } finally {
        setLoading(false)
    }
  }

  function imprimir(exame) {
    const content = `
        <html>
            <head>
                <title>Exame de ${exame.atleta}</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 5px; }
                    .info { margin-bottom: 15px; }
                    .info span { font-weight: bold; }
                    .resultado { margin-top: 20px; white-space: pre-wrap; border: 1px solid #ccc; padding: 10px; }
                </style>
            </head>
            <body>
                <h1>Relatório de Exame</h1>
                <div class="info"><span>Atleta:</span> ${exame.atleta}</div>
                <div class="info"><span>Tipo:</span> ${exame.tipo}</div>
                <div class="info"><span>Data:</span> ${new Date(exame.data + "T00:00:00").toLocaleDateString("pt-BR")}</div>
                ${exame.obs ? `<div class="info"><span>Observação:</span> ${exame.obs}</div>` : ''}
                <h2>Resultado:</h2>
                <div class="resultado">${exame.resultado || 'Nenhum resultado registrado.'}</div>
                <script>window.print()</script>
            </body>
        </html>
    `
    const printWindow = window.open('', '', 'height=600,width=800')
    printWindow.document.write(content)
    printWindow.document.close()
  }

  const filteredLista = lista.filter(e => 
    e.atleta.toLowerCase().includes(q.toLowerCase()) || 
    e.tipo.toLowerCase().includes(q.toLowerCase()) ||
    e.resultado.toLowerCase().includes(q.toLowerCase())
  )
  
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Gerenciamento de Exames</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">{editingId ? 'Editar Exame' : 'Novo Exame'}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Atleta</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={form.atleta}
              onChange={(e) => handleChange('atleta', e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Exame</label>
            <select
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={form.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              required
              disabled={loading}
            >
                <option>Avaliação Física</option>
                <option>Exame Médico</option>
                <option>Exame de Imagem</option>
                <option>Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Data</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={form.data}
              onChange={(e) => handleChange('data', e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Resultado</label>
            <textarea
                className="w-full border rounded-lg px-3 py-2 mt-1"
                rows="4"
                value={form.resultado}
                onChange={(e) => handleChange('resultado', e.target.value)}
                disabled={loading}
            ></textarea>
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={form.obs}
                onChange={(e) => handleChange('obs', e.target.value)}
                disabled={loading}
            />
        </div>
        
        {error && <div className="text-red-600 font-medium">{error}</div>}

        <div className="flex justify-end gap-3 pt-4">
          {editingId && (
            <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                disabled={loading}
            >
                Cancelar Edição
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Salvando..." : editingId ? "Atualizar Exame" : "Salvar Exame"}
          </button>
        </div>
      </form>
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-3">Exames Salvos ({filteredLista.length})</h3>
        <div className="mb-4">
            <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Pesquisar por atleta, tipo ou resultado..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
            />
        </div>

        {loading && !lista.length ? (
            <div className="text-blue-600">Carregando exames...</div>
        ) : (
          <div className="space-y-4">
            {filteredLista.length === 0 && <div className="text-gray-500">Nenhum exame encontrado.</div>}
            {filteredLista.slice().reverse().map((e) => (
              <div key={e._id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start">
                <div>
                  <div className="font-medium text-base">{e.atleta}</div>
                  <div className="text-xs text-gray-500">
                    {e.tipo} • {new Date(e.data + "T00:00:00").toLocaleDateString("pt-BR")}
                  </div>
                  <div className="text-sm mt-2 text-gray-700">
                    {e.resultado ? (e.resultado.length > 200 ? e.resultado.slice(0, 200) + "..." : e.resultado) : <i className="text-gray-400">Sem resultado</i>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => imprimir(e)}
                    className="text-blue-600 hover:underline text-sm"
                    disabled={loading}
                  >
                    Imprimir
                  </button>
                  <button
                    onClick={() => editar(e)}
                    className="text-green-600 hover:underline text-sm"
                    disabled={loading}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => excluir(e._id)}
                    className="text-red-600 hover:underline text-sm"
                    disabled={loading}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}


