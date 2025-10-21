import express from "express"
import Time from "../models/Time.js"
import auth from "../middleware/auth.js"

const router = express.Router()

router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Acesso negado: apenas admin pode criar times." })
    }

    const { nome } = req.body
    if (!nome) {
      return res.status(400).json({ msg: "O nome do time é obrigatório." })
    }

    const existente = await Time.findOne({ nome })
    if (existente) {
      return res.status(400).json({ msg: "Time já existe." })
    }

    const novoTime = new Time({ nome })
    await novoTime.save()

    res.status(201).json({ msg: "Time criado com sucesso!", time: novoTime })
  } catch (err) {
    console.error("Erro ao criar time:", err)
    res.status(500).json({ msg: "Erro interno ao criar time." })
  }
})

router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const times = await Time.find().sort({ nome: 1 })
      return res.json(times)
    }

    const meuTime = await Time.find({ nome: req.user.time })
    res.json(meuTime)
  } catch (err) {
    console.error("Erro ao listar times:", err)
    res.status(500).json({ msg: "Erro interno ao listar times." })
  }
})

export default router

