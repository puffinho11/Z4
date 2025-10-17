const express = require("express")
const Chamada = require("../models/Chamada")

const router = express.Router()

router.post("/", async (req, res) => {
  try {
    const { categoria, data, professor, atletas } = req.body
    if (!categoria || !data || !professor || !Array.isArray(atletas)) {
      return res.status(400).json({
        msg: "Campos obrigatórios: categoria, data, professor e lista de atletas.",
      })
    }

    const novaChamada = new Chamada({ categoria, data, professor, atletas })
    await novaChamada.save()
    res.status(201).json({ msg: "✅ Chamada salva com sucesso!", chamada: novaChamada })
  } catch (err) {
    console.error("❌ Erro ao salvar chamada:", err)
    res.status(500).json({ msg: "Erro interno ao salvar chamada." })
  }
})

router.get("/", async (req, res) => {
  try {
    const chamadas = await Chamada.find().sort({ createdAt: -1 })
    res.json(chamadas)
  } catch (err) {
    console.error("❌ Erro ao listar chamadas:", err)
    res.status(500).json({ msg: "Erro interno ao listar chamadas." })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const chamada = await Chamada.findById(req.params.id)
    if (!chamada) return res.status(404).json({ msg: "Chamada não encontrada." })
    res.json(chamada)
  } catch (err) {
    console.error("❌ Erro ao buscar chamada:", err)
    res.status(500).json({ msg: "Erro interno ao buscar chamada." })
  }
})

router.put("/:id", async (req, res) => {
  try {
    const atualizada = await Chamada.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!atualizada) return res.status(404).json({ msg: "Chamada não encontrada para atualização." })
    res.json({ msg: "✅ Chamada atualizada com sucesso!", chamada: atualizada })
  } catch (err) {
    console.error("❌ Erro ao atualizar chamada:", err)
    res.status(500).json({ msg: "Erro interno ao atualizar chamada." })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const deletada = await Chamada.findByIdAndDelete(req.params.id)
    if (!deletada) return res.status(404).json({ msg: "Chamada não encontrada para exclusão." })
    res.json({ msg: "🗑️ Chamada excluída com sucesso!" })
  } catch (err) {
    console.error("❌ Erro ao excluir chamada:", err)
    res.status(500).json({ msg: "Erro interno ao excluir chamada." })
  }
})

module.exports = router




