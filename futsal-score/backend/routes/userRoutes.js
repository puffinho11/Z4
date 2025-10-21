import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.json(users)
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    res.status(500).json({ msg: "Erro ao buscar usuários." })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })
    if (!user) return res.status(400).json({ msg: "Usuário não encontrado." })

    const senhaCorreta = await bcrypt.compare(password, user.password)
    if (!senhaCorreta) return res.status(400).json({ msg: "Senha incorreta." })

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, time: user.time },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    )

    res.json({
      msg: "Login realizado com sucesso!",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        time: user.time,
      },
    })
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    res.status(500).json({ msg: "Erro interno no servidor." })
  }
})

router.post("/register", async (req, res) => {
  try {
    const { username, password, role, time } = req.body

    const existente = await User.findOne({ username })
    if (existente) return res.status(400).json({ msg: "Usuário já existe." })

    const senhaCriptografada = await bcrypt.hash(password, 10)

    const novoUser = new User({
      username,
      password: senhaCriptografada,
      role: role || "user",
      time: time || null,
    })

    await novoUser.save()
    res.status(201).json({ msg: "Usuário criado com sucesso!" })
  } catch (error) {
    console.error("Erro ao registrar usuário:", error)
    res.status(500).json({ msg: "Erro ao registrar usuário." })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    await User.findByIdAndDelete(id)
    res.json({ msg: "Usuário removido com sucesso!" })
  } catch (error) {
    console.error("Erro ao remover usuário:", error)
    res.status(500).json({ msg: "Erro ao remover usuário." })
  }
})

export default router






