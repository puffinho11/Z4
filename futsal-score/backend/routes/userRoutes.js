import express from "express"
import User from "../models/User.js"
import bcrypt from "bcryptjs"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Acesso negado" })
    }

    const users = await User.find().select("-password")
    res.json(users)
  } catch (err) {
    console.error("Erro ao buscar usuários:", err)
    res.status(500).json({ msg: "Erro ao buscar usuários" })
  }
})

router.post("/register", authMiddleware, async (req, res) => {
  try {
    const { username, password, role, time } = req.body

    if (!username || !password) {
      return res.status(400).json({ msg: "Campos obrigatórios ausentes" })
    }

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ msg: "Usuário já existe" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      username,
      password: hashedPassword,
      role: role || "user",
      time: time || "",
    })

    await newUser.save()
    res.status(201).json({ msg: "Usuário criado com sucesso" })
  } catch (err) {
    console.error("Erro ao criar usuário:", err)
    res.status(500).json({ msg: "Erro ao criar usuário" })
  }
})

router.put("/:username", authMiddleware, async (req, res) => {
  try {
    const { username } = req.params
    const { password, role, time } = req.body

    const user = await User.findOne({ username })
    if (!user) return res.status(404).json({ msg: "Usuário não encontrado" })

    if (password) user.password = await bcrypt.hash(password, 10)
    user.role = role
    user.time = time

    await user.save()
    res.json({ msg: "Usuário atualizado com sucesso" })
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err)
    res.status(500).json({ msg: "Erro ao atualizar usuário" })
  }
})

router.delete("/:username", authMiddleware, async (req, res) => {
  try {
    const { username } = req.params
    const deletedUser = await User.findOneAndDelete({ username })

    if (!deletedUser) {
      return res.status(404).json({ msg: "Usuário não encontrado" })
    }

    res.json({ msg: "Usuário removido com sucesso" })
  } catch (err) {
    console.error("Erro ao remover usuário:", err)
    res.status(500).json({ msg: "Erro ao remover usuário" })
  }
})

export default router

