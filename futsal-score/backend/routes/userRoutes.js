import express from "express"
import User from "../models/User.js"
import bcrypt from "bcryptjs"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Acesso negado" })
    }
    const users = await User.find().select("-password")
    res.json(users)
  } catch (err) {
    console.error("Erro ao buscar usuários:", err)
    res.status(500).json({ message: "Erro ao buscar usuários" })
  }
})

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { username, password, role, team } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: "Campos obrigatórios ausentes" })
    }

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ message: "Usuário já existe" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      username,
      password: hashedPassword,
      role: role || "user",
      team: team || "",
    })

    await newUser.save()
    res.status(201).json({ message: "Usuário criado com sucesso" })
  } catch (err) {
    console.error("Erro ao criar usuário:", err)
    res.status(500).json({ message: "Erro ao criar usuário" })
  }
})

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { username, password, role, team } = req.body

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        username,
        ...(password && { password: await bcrypt.hash(password, 10) }),
        role,
        team,
      },
      { new: true }
    )

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json({ message: "Usuário atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    res.status(500).json({ message: "Erro ao atualizar usuário" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id)

    if (!deletedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    res.json({ message: "Usuário removido com sucesso" })
  } catch (err) {
    console.error("Erro ao remover usuário:", err)
    res.status(500).json({ message: "Erro ao remover usuário" })
  }
})

export default router
