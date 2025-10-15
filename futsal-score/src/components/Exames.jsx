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

  function handleChange(key, value) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.atleta || !form.tipo || !form.data) {
      alert("Preencha Atleta, Tipo e Data.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      if (editingId) {
        await api.put(`/exames/${editingId}`, form)
        alert(`Exame de ${form.atleta} atualizado!`)
      } else {
        await api.post("/exames", form)
        alert(`Novo exame para ${form.atleta} salvo!`)
      }

      await fetchExames()

      setForm(blank);
      setEditingId(null)

    } catch (err) {
      console.error("Erro ao salvar/atualizar exame:", err.response || err)
      setError("Erro ao salvar o exame. Verifique se está logado.")
    } finally {
      setLoading(false)
    }
  }
  function editar(exame) {
    setEditingId(exame._id); 
    setForm({
      atleta: exame.atleta,
      tipo: exame.tipo,
      resultado: exame.resultado,
      data: exame.data,
      obs: exame.obs,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function excluir(id) {
    if (!window.confirm("Excluir este exame?")) return

    setLoading(true)
    setError(null)
    try {

      await api.delete(`/exames/${id}`);
      
      setLista(p => p.filter(e => e._id !== id))
      alert("Exame excluído com sucesso!")

    } catch (err) {
      console.error("Erro ao excluir exame:", err.response || err)
      setError("Erro ao excluir. Verifique se está logado.")
    } finally {
      setLoading(false)
    }
  }

  const filteredLista = lista.filter((e) =>
    e.atleta.toLowerCase().includes(q.toLowerCase()) ||
    e.tipo.toLowerCase().includes(q.toLowerCase())
  );

  function imprimir(e) {
    const laudoWindow = window.open("", "_blank")
    laudoWindow.document.write(`
      <html>
        <head>
          <title>Laudo de Exame - ${e.atleta}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
            h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 5px; }
            .section { margin-top: 20px; border: 1px solid #ccc; padding: 15px; border-radius: 8px; }
            .section h2 { font-size: 1.1em; color: #333; margin-top: 0; }
          </style>
        </head>
        <body>
          <h1>Laudo de Exame - Futsal Score</h1>
          
          <div class="section">
            <h2>Dados do Atleta e Exame</h2>
            <p><strong>Atleta:</strong> ${e.atleta}</p>
            <p><strong>Tipo de Exame:</strong> ${e.tipo}</p>
            <p><strong>Data:</strong> ${new Date(e.data + "T00:00:00").toLocaleDateString("pt-BR")}</p>
          </div>

          <div class="section">
            <h2>Resultado</h2>
            <pre style="white-space: pre-wrap;">${e.resultado || 'Sem resultado registrado.'}</pre>
          </div>
          
          <div class="section">
            <h2>Observações</h2>
            <pre style="white-space: pre-wrap;">${e.obs || 'Nenhuma observação registrada.'}</pre>
          </div>

          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background-color: #1e40af; color: white; border: none; cursor: pointer;">Imprimir</button>
        </body>
      </html>
    `);
    laudoWindow.document.close();
  }

  return (
    <section className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold">Monitoramento de Exames</h2>
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow space-y-4">
        <h3 className="font-semibold text-lg">
          {editingId ? "Editar Exame" : "Cadastrar Novo Exame"}
        </h3>
        <div>
          <label className="block text-sm">Atleta</label>
          <input
            value={form.atleta}
            onChange={(e) => handleChange("atleta", e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Tipo de Exame</label>
            <select
              value={form.tipo}
              onChange={(e) => handleChange("tipo", e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option>Avaliação Física</option>
              <option>Hemograma</option>
              <option>Cardíaco</option>
              <option>Outro</option>
            </select>
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
        </div>

        <div>
          <label className="block text-sm">Resultado</label>
          <textarea
            value={form.resultado}
            onChange={(e) => handleChange("resultado", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 h-24"
            placeholder="Resultado do exame, observações importantes, etc."
          ></textarea>
        </div>
        
        <div>
          <label className="block text-sm">Observações</label>
          <textarea
            value={form.obs}
            onChange={(e) => handleChange("obs", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 h-16"
            placeholder="Observações adicionais para uso interno."
          ></textarea>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Processando..." : editingId ? "Atualizar Exame" : "Salvar Exame"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(blank);
              setEditingId(null);
            }}
            className="px-3 py-2 rounded-lg border"
            disabled={loading}
          >
            Limpar
          </button>
        </div>
      </form>
      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="font-semibold mb-3">Exames Cadastrados</h3>
        
        <input
            className="w-full border rounded-lg px-3 py-2 mb-4"
            placeholder="Pesquisar por atleta ou tipo de exame..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
        />

        {loading && <div className="text-blue-600">Carregando exames...</div>}

        {!loading && filteredLista.length === 0 && (
          <div className="text-gray-500">
            {q ? "Nenhum exame encontrado com a pesquisa." : "Nenhum exame cadastrado."}
          </div>
        )}

        {!loading && filteredLista.length > 0 && (
          <div className="space-y-3">
            {filteredLista.slice().reverse().map((e) => (
              <div
                key={e._id}
                className="p-3 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
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


