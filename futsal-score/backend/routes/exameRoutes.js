import express from "express"
import Exame from "../models/Exame.js"
import auth from "../middleware/auth.js"

const router = express.Router()

router.post("/", auth, async (req, res) => {
  const { id, atleta, tipo, resultado, data, obs, time } = req.body

  try {
    if (id) {

      const exame = await Exame.findByIdAndUpdate(
        id,
        { atleta, tipo, resultado, data, obs },
        { new: true }
      );

      if (!exame) {
        return res.status(404).json({ msg: "Exame não encontrado." })
      }

      return res.json(exame)
    
    } else {
      const novoExame = new Exame({
        atleta,
        tipo,
        resultado,
        data,
        obs,
        time: req.user.isAdmin ? time : req.user.time,
      })

      const exame = await novoExame.save()
      return res.status(201).json(exame)
    }
  } catch (err) {
    console.error("Erro ao salvar exame:", err)
    res.status(500).send("Erro no Servidor")
  }
})

router.get("/", auth, async (req, res) => {
  try {
    const query = req.user.isAdmin ? {} : { time: req.user.time }
    const exames = await Exame.find(query).sort({ data: -1, createdAt: -1 })
    res.json(exames)
  } catch (err) {
    console.error("Erro ao buscar exames:", err)
    res.status(500).send("Erro no Servidor")
  }
})

router.delete("/:id", auth, async (req, res) => {
  try {
    const exame = await Exame.findById(req.params.id)

    if (!exame) {
      return res.status(404).json({ msg: "Exame não encontrado." })
    }

    await exame.deleteOne()
    res.json({ msg: "Exame removido com sucesso." })
  } catch (err) {
    console.error("Erro ao deletar exame:", err)
    res.status(500).send("Erro no Servidor")
  }
})

export default router
