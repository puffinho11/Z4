import express from "express"
import Chamada from "../models/Chamada.js"

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const chamadas = await Chamada.find().sort({ createdAt: -1 })
    res.json(chamadas)
  } catch (error) {
    console.error("Erro ao buscar chamadas:", error)
    res.status(500).json({ msg: "Erro ao buscar chamadas." })
  }
})

router.post("/", async (req, res) => {
  try {
    const { categoria, data, professor, atletas, time } = req.body

    const novaChamada = new Chamada({
      categoria,
      data,
      professor,
      atletas,
      time,
    })

    await novaChamada.save()
    res.status(201).json({ msg: "Chamada registrada com sucesso!", novaChamada })
  } catch (error) {
    console.error("Erro ao registrar chamada:", error)
    res.status(500).json({ msg: "Erro ao registrar chamada." })
  }
})

router.put("/:id", async (req, res) => {
  try {
    const chamadaAtualizada = await Chamada.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!chamadaAtualizada) {
      return res.status(404).json({ msg: "Chamada não encontrada." })
    }
    res.json(chamadaAtualizada)
  } catch (error) {
    console.error("Erro ao atualizar chamada:", error)
    res.status(500).json({ msg: "Erro ao atualizar chamada." })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const chamadaRemovida = await Chamada.findByIdAndDelete(req.params.id)
    if (!chamadaRemovida) {
      return res.status(404).json({ msg: "Chamada não encontrada." })
    }
    res.json({ msg: "Chamada removida com sucesso!" })
  } catch (error) {
    console.error("Erro ao remover chamada:", error)
    res.status(500).json({ msg: "Erro ao remover chamada." })
  }
})

export default router






