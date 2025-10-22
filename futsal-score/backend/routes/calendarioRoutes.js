import express from "express"
import Calendario from "../models/Calendario.js"
import authMiddleware from "../middleware/authMiddleware.js" 

const router = express.Router()

const checkIsAdmin = (user) => {
    const role =
      user.role?.toLowerCase?.() ||
      user.nivel?.toLowerCase?.() ||
      user.tipo?.toLowerCase?.() ||
      ""
    return role === "admin" || user.isAdmin === true
}

router.post("/", authMiddleware, async (req, res) => {
  const { id, titulo, adversario, data, hora, local, time } = req.body

  try {
    const user = req.user
    const isAdmin = checkIsAdmin(user)
    const eventoTime = isAdmin 
      ? (time || "Todos") 
      : user.time

    if (!titulo || !data || !hora || !eventoTime) {
      return res.status(400).json({
        msg: "Campos obrigatórios faltando: título, data, hora ou time."
      })
    }

    if (id) {
      const evento = await Calendario.findByIdAndUpdate(
        id, 
        { titulo, adversario, data, hora, local, time: eventoTime },
        { new: true } 
      )
      if (!evento) {
        return res.status(404).json({ msg: "Evento não encontrado para atualização." })
      }
      return res.json(evento)
    }

    const novoEvento = new Calendario({ 
      titulo, adversario, data, hora, local, time: eventoTime 
    })
    await novoEvento.save()

    res.status(201).json(novoEvento)
  } catch (err) {
    console.error("Erro ao criar/atualizar evento:", err)
    res.status(500).json({ msg: "Erro no servidor ao criar/atualizar evento." })
  }
})

router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = req.user
    const isAdmin = checkIsAdmin(user)

    const query = {}
    
    if (!isAdmin && user.time) {
      query.time = user.time 
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    query.data = { $gte: today } 

    const eventos = await Calendario.find(query).sort({ data: 1, hora: 1 })
    res.json(eventos)
  } catch (err) {
    console.error("Erro ao carregar eventos:", err)
    res.status(500).json({ msg: "Erro no servidor ao carregar eventos." })
  }
})

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const evento = await Calendario.findById(req.params.id)

    if (!evento) {
      return res.status(404).json({ msg: "Evento não encontrado." })
    }

    const user = req.user
    const isAdmin = checkIsAdmin(user)
    
    if (!isAdmin && evento.time !== user.time) {
      return res.status(403).json({ msg: "Acesso negado." })
    }

    await Calendario.findByIdAndDelete(req.params.id)

    res.json({ msg: "Evento deletado com sucesso." })
  } catch (err) {
    console.error("Erro ao deletar evento:", err)
    res.status(500).json({ msg: "Erro no servidor ao deletar evento." })
  }
})

export default router