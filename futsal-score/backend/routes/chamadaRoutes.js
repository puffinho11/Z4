// backend/routes/chamadaRoutes.js
import express from "express"
import Chamada from "../models/Chamada.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

// ✅ Criar nova chamada
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { categoria, data, professor, atletas } = req.body

    if (!categoria || !data || !professor || !Array.isArray(atletas)) {
      return res.status(400).json({ message: "Campos obrigatórios ausentes." })
    }

    const novaChamada = new Chamada({ categoria, data, professor, atletas })
    await novaChamada.save()

    res.status(201).json(novaChamada)
  } catch (err) {
    console.error("Erro ao criar chamada:", err)
    res.status(500).json({ message: "Erro ao criar chamada." })
  }
})

// ✅ Buscar todas as chamadas
router.get("/", authMiddleware, async (req, res) => {
  try {
    const chamadas = await Chamada.find().sort({ data: -1 })
    res.json(chamadas)
  } catch (err) {
    console.error("Erro ao buscar chamadas:", err)
    res.status(500).json({ message: "Erro ao buscar chamadas." })
  }
})

// ✅ Buscar chamada por ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const chamada = await Chamada.findById(req.params.id)
    if (!chamada)
      return res.status(404).json({ message: "Chamada não encontrada." })
    res.json(chamada)
  } catch (err) {
    console.error("Erro ao buscar chamada:", err)
    res.status(500).json({ message: "Erro ao buscar chamada." })
  }
})

// ✅ Atualizar chamada
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { categoria, data, professor, atletas } = req.body
    const chamadaAtualizada = await Chamada.findByIdAndUpdate(
      req.params.id,
      { categoria, data, professor, atletas },
      { new: true }
    )

    if (!chamadaAtualizada)
      return res.status(404).json({ message: "Chamada não encontrada." })

    res.json(chamadaAtualizada)
  } catch (err) {
    console.error("Erro ao atualizar chamada:", err)
    res.status(500).json({ message: "Erro ao atualizar chamada." })
  }
})

// ✅ Excluir chamada
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const chamadaRemovida = await Chamada.findByIdAndDelete(req.params.id)
    if (!chamadaRemovida)
      return res.status(404).json({ message: "Chamada não encontrada." })

    res.json({ message: "Chamada excluída com sucesso." })
  } catch (err) {
    console.error("Erro ao excluir chamada:", err)
    res.status(500).json({ message: "Erro ao excluir chamada." })
  }
})

export default router
