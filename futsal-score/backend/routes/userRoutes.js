import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import auth from "../middleware/auth.js"

const router = express.Router()

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado." })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ msg: "Senha incorreta." })
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        team: user.team || null,
      },
    })
  } catch (error) {
    console.error("Erro no login:", error)
    res.status(500).json({ msg: "Erro no servidor ao fazer login." })
  }
})

router.get("/", auth, async (req, res) => {
  try {
    const role =
      req.user.role?.toLowerCase?.() ||
      req.user.nivel?.toLowerCase?.() ||
      req.user.tipo?.toLowerCase?.() ||
      "";
    const isAdmin = role === "admin" || req.user.isAdmin === true

    if (!isAdmin) {
      return res
        .status(403)
        .json({ msg: "Acesso negado. Apenas administradores." })
    }

    const users = await User.find({}, "-password")
    res.json(users)
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    res.status(500).json({ msg: "Erro ao buscar usuários." })
  }
})

router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-password");
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado." })
    }
    res.json(user)
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    res.status(500).json({ msg: "Erro ao buscar usuário." })
  }
})

router.put("/:id", auth, async (req, res) => {
  try {
    const role =
      req.user.role?.toLowerCase?.() ||
      req.user.nivel?.toLowerCase?.() ||
      req.user.tipo?.toLowerCase?.() ||
      "";
    const isAdmin = role === "admin" || req.user.isAdmin === true;

    if (!isAdmin && req.user.id !== req.params.id) {
      return res
        .status(403)
        .json({ msg: "Sem permissão para editar este usuário." })
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      select: "-password",
    })

    if (!updatedUser) {
      return res.status(404).json({ msg: "Usuário não encontrado." })
    }

    res.json(updatedUser)
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    res.status(500).json({ msg: "Erro ao atualizar usuário." })
  }
})

router.delete("/:id", auth, async (req, res) => {
  try {
    const role =
      req.user.role?.toLowerCase?.() ||
      req.user.nivel?.toLowerCase?.() ||
      req.user.tipo?.toLowerCase?.() ||
      ""
    const isAdmin = role === "admin" || req.user.isAdmin === true

    if (!isAdmin) {
      return res
        .status(403)
        .json({ msg: "Apenas administradores podem excluir usuários." })
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id)
    if (!deletedUser) {
      return res.status(404).json({ msg: "Usuário não encontrado." })
    }

    res.json({ msg: "Usuário removido com sucesso." })
  } catch (error) {
    console.error("Erro ao excluir usuário:", error)
    res.status(500).json({ msg: "Erro ao excluir usuário." })
  }
})

export default router


