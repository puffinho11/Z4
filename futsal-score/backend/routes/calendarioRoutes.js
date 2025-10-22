import express from "express"
import Calendario from "../models/Calendario.js"

const router = express.Router()

router.post("/", async (req, res) => {
  try {
    const novoEvento = new Calendario(req.body)
    await novoEvento.save()
    res.status(201).json(novoEvento)
  } catch (err) {
    console.error("Erro ao criar evento:", err)
    res.status(500).json({ msg: "Erro ao criar evento." })
  }
})

router.get("/", async (req, res) => {
  try {
    const eventos = await Calendario.find().sort({ data: 1 })
    res.json(eventos)
  } catch (err) {
    console.error("Erro ao buscar eventos:", err)
    res.status(500).json({ msg: "Erro ao buscar eventos." })
  }
})

router.put("/:id", async (req, res) => {
  try {
    const eventoAtualizado = await Calendario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!eventoAtualizado)
      return res.status(404).json({ msg: "Evento não encontrado." })
    res.json(eventoAtualizado)
  } catch (err) {
    console.error("Erro ao atualizar evento:", err)
    res.status(500).json({ msg: "Erro ao atualizar evento." })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const eventoRemovido = await Calendario.findByIdAndDelete(req.params.id)
    if (!eventoRemovido)
      return res.status(404).json({ msg: "Evento não encontrado." })
    res.json({ msg: "Evento removido com sucesso!" })
  } catch (err) {
    console.error("Erro ao excluir evento:", err)
    res.status(500).json({ msg: "Erro ao excluir evento." })
  }
})

export default router
