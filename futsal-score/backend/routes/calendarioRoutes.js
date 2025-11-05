import express from "express"
import Calendario from "../models/Calendario.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/", authMiddleware, async (req, res) => {
  try {
    const novoEvento = new Calendario({
      ...req.body,
      time: req.user.time,
      criadoPor: req.user.username,
    })

    await novoEvento.save()
    res.status(201).json(novoEvento)
  } catch (err) {
    console.error("Erro ao criar evento:", err)
    res.status(500).json({ msg: "Erro ao criar evento." })
  }
})

router.get("/", authMiddleware, async (req, res) => {
  try {
    const eventos = await Calendario.find({ time: req.user.time }).sort({ data: 1 })
    res.json(eventos)
  } catch (err) {
    console.error("Erro ao buscar eventos:", err)
    res.status(500).json({ msg: "Erro ao buscar eventos." })
  }
})

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const filtro =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : { _id: req.params.id, time: req.user.time }

    const evento = await Calendario.findOneAndUpdate(filtro, req.body, { new: true })

    if (!evento)
      return res.status(403).json({ msg: "Sem permissão para editar este evento." })

    res.json(evento)
  } catch (err) {
    console.error("Erro ao atualizar evento:", err)
    res.status(500).json({ msg: "Erro ao atualizar evento." })
  }
})

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const filtro =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : { _id: req.params.id, time: req.user.time }

    const evento = await Calendario.findOneAndDelete(filtro)

    if (!evento)
      return res.status(403).json({ msg: "Sem permissão para excluir este evento." })

    res.json({ msg: "Evento removido com sucesso!" })
  } catch (err) {
    console.error("Erro ao excluir evento:", err)
    res.status(500).json({ msg: "Erro ao excluir evento." })
  }
})

export default router


