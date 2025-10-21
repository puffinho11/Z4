import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

const router = express.Router()

router.post("/login", async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await User.findOne({ username })
    if (!user) return res.status(400).json({ msg: "Usuário não encontrado." })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ msg: "Senha incorreta." })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        time: user.time,
      },
    })
  } catch (err) {
    console.error("Erro no login:", err)
    res.status(500).json({ msg: "Erro no servidor." })
  }
})

router.post("/register", async (req, res) => {
  try {
    const { username, password, role, time } = req.body

    const existingUser = await User.findOne({ username })
    if (existingUser)
      return res.status(400).json({ msg: "Usuário já existe." })

    const hashed = await bcrypt.hash(password, 10)
    const newUser = new User({ username, password: hashed, role, time })
    await newUser.save()

    res.status(201).json({ msg: "Usuário criado com sucesso!" })
  } catch (error) {
    console.error("Erro ao registrar usuário:", error)
    res.status(500).json({ msg: "Erro interno do servidor." })
  }
})

export default router




