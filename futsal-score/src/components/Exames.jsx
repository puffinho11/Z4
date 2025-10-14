// src/components/Exames.jsx
import React, { useEffect, useState } from "react";
import { getItem, setItem } from "../utils/storage";

/**
 * Exames.jsx
 * Conversão fiel da seção "Exames" do HTML original para React.
 *
 * Funcionalidades:
 * - Cadastrar exame (atleta, tipo, data, resultado, observações)
 * - Editar exame (preenche o formulário para editar)
 * - Excluir exame
 * - Imprimir/abrir laudo em nova janela
 * - Salva em localStorage na chave EXAMES_KEY (sfinge_exames_v1)
 *
 * Colar este arquivo em src/components/Exames.jsx
 */

const EXAMES_KEY = "sfinge_exames_v1";

export default function Exames() {
  const [lista, setLista] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    atleta: "",
    tipo: "Avaliação Física",
    resultado: "",
    data: new Date().toISOString().slice(0, 10),
    obs: "",
  });
  const [q, setQ] = useState(""); // pesquisa simples

  useEffect(() => {
    const arr = getItem(EXAMES_KEY, []);
    setLista(arr);
  }, []);

  function handleChange(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      atleta: "",
      tipo: "Avaliação Física",
      resultado: "",
      data: new Date().toISOString().slice(0, 10),
      obs: "",
    });
  }

  function salvar(e) {
    e?.preventDefault();
    if (!form.atleta?.trim()) {
      alert("Informe o nome do atleta.");
      return;
    }
    const arr = getItem(EXAMES_KEY, []);
    if (editingId) {
      const idx = arr.findIndex((i) => i.id === editingId);
      if (idx !== -1) {
        arr[idx] = { ...arr[idx], ...form };
        setItem(EXAMES_KEY, arr);
        setLista(arr);
        resetForm();
        return;
      }
    }
    const novo = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      ...form,
    };
    arr.push(novo);
    setItem(EXAMES_KEY, arr);
    setLista(arr);
    resetForm();
  }

  function editar(id) {
    const arr = getItem(EXAMES_KEY, []);
    const item = arr.find((i) => i.id === id);
    if (!item) return;
    setEditingId(id);
    setForm({
      atleta: item.atleta || "",
      tipo: item.tipo || "Avaliação Física",
      resultado: item.resultado || "",
      data: item.data || new Date().toISOString().slice(0, 10),
      obs: item.obs || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function excluir(id) {
    if (!confirm("Excluir exame?")) return;
    const arr = getItem(EXAMES_KEY, []).filter((i) => i.id !== id);
    setItem(EXAMES_KEY, arr);
    setLista(arr);
    if (editingId === id) resetForm();
  }

  function imprimir(item) {
    // Monta HTML do laudo (mantendo layout simples, mas claro)
    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Laudo - ${item.atleta}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          body{font-family: Arial, Helvetica, sans-serif; color:#111; padding:24px;}
          .card{border:1px solid #ddd; padding:18px; border-radius:8px; max-width:800px; margin:0 auto;}
          .header{display:flex;justify-content:space-between; align-items:center; margin-bottom:12px;}
          h1{font-size:20px;margin:0;}
          .meta{color:#555;font-size:13px;margin-bottom:12px;}
          pre{white-space:pre-wrap; font-size:14px; line-height:1.35;}
          .footer{margin-top:16px; font-size:12px; color:#666;}
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>LAUDO — ${item.tipo}</h1>
            <div>${new Date(item.data).toLocaleDateString('pt-BR')}</div>
          </div>
          <div class="meta">Atleta: <strong>${item.atleta}</strong></div>
          <div><strong>Resultado:</strong></div>
          <pre>${(item.resultado && item.resultado.replace(/</g, "&lt;")) || "—"}</pre>
          <div style="margin-top:12px"><strong>Observações:</strong></div>
          <pre>${(item.obs && item.obs.replace(/</g, "&lt;")) || "—"}</pre>
          <div class="footer">Gerado por Futsal Score — ${new Date().toLocaleString('pt-BR')}</div>
        </div>
        <script>
          setTimeout(()=>window.print(), 350);
        </script>
      </body>
      </html>
    `;
    const w = window.open("", "_blank");
    if (!w) {
      alert("O navegador bloqueou a abertura da janela. Permita pop-ups e tente novamente.");
      return;
    }
    w.document.write(html);
    w.document.close();
  }

  const filtered = lista
    .slice()
    .reverse()
    .filter((it) => {
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        (it.atleta || "").toLowerCase().includes(s) ||
        (it.tipo || "").toLowerCase().includes(s) ||
        (it.resultado || "").toLowerCase().includes(s)
      );
    });

  return (
    <div className="bg-white p-6 rounded-2xl shadow max-w-3xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold">Exames Médicos</h2>

      {/* Form */}
      <form onSubmit={salvar} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Nome do atleta</label>
          <input
            value={form.atleta}
            onChange={(e) => handleChange("atleta", e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Ex: João Silva"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Tipo de exame</label>
            <select
              value={form.tipo}
              onChange={(e) => handleChange("tipo", e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option>Avaliação Física</option>
              <option>Exame Clínico</option>
              <option>Retorno</option>
              <option>Cardíaco</option>
              <option>Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Data do exame</label>
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
          <label className="block text-sm font-medium">Resultado / Laudo</label>
          <textarea
            value={form.resultado}
            onChange={(e) => handleChange("resultado", e.target.value)}
            rows="4"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Descreva aqui o resultado do exame..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Observações</label>
          <textarea
            value={form.obs}
            onChange={(e) => handleChange("obs", e.target.value)}
            rows="2"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Observações adicionais (opcional)"
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            {editingId ? "Atualizar exame" : "Salvar exame"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="px-3 py-2 rounded-lg border text-sm"
          >
            Limpar
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                if (!confirm("Cancelar edição?")) return;
                resetForm();
              }}
              className="px-3 py-2 rounded-lg border text-sm text-red-600"
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      {/* Pesquisa + Ações */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar por atleta, tipo ou resultado..."
            className="border rounded-lg px-3 py-2 w-72"
          />
          <button
            onClick={() => {
              setQ("");
            }}
            className="px-3 py-2 rounded-lg border text-sm"
          >
            Limpar
          </button>
        </div>

        <div className="text-sm text-gray-500">
          Total: <strong>{lista.length}</strong>
        </div>
      </div>

      {}
      <div>
        {filtered.length === 0 ? (
          <div className="text-gray-500">Nenhum exame encontrado.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => (
              <div
                key={e.id}
                className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
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
                  >
                    Imprimir
                  </button>
                  <button
                    onClick={() => editar(e.id)}
                    className="text-green-600 hover:underline text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => excluir(e.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


