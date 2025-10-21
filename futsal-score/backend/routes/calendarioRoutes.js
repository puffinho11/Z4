import express from "express"
import Calendario from "../models/Calendario.js"
import auth from "../middleware/auth.js"

const router = express.Router()

router.post("/", auth, async (req, res) => {
  const { id, titulo, adversario, data, hora, local, time } = req.body

  try {
    if (id) {

      const evento = await Calendario.findByIdAndUpdate(
        id,
        { titulo, adversario, data, hora, local },
        { new: true }
      )

      if (!evento) {
        return res.status(404).json({ msg: "Evento não encontrado." })
      }

      return res.json(evento)
    } else {

      const novoEvento = new Calendario({
        titulo,
        adversario,
        data,
        hora,
        local,
        time: req.user.isAdmin ? time : req.user.time,
      })

      const evento = await novoEvento.save()
      return res.status(201).json(evento)
    }
  } catch (err) {
    console.error("Erro ao criar/atualizar evento:", err)
    res.status(500).send("Erro no Servidor")
  }
})

router.get("/", auth, async (req, res) => {
  try {
    const query = req.user.isAdmin ? {} : { time: req.user.time }
    const eventos = await Calendario.find(query).sort({ data: 1, hora: 1 })
    res.json(eventos)
  } catch (err) {
    console.error("Erro ao carregar eventos:", err)
    res.status(500).send("Erro no Servidor")
  }
})

router.delete("/:id", auth, async (req, res) => {
  try {
    const evento = await Calendario.findById(req.params.id)

    if (!evento) {
      return res.status(404).json({ msg: "Evento não encontrado." })
    }

    await evento.deleteOne()
    res.json({ msg: "Evento removido com sucesso." })
  } catch (err) {
    console.error("Erro ao deletar evento:", err)
    res.status(500).send("Erro no Servidor")
  }
})

export default router
