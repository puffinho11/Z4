import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import multer from "multer"
import path from "path"
import fs from "fs"
import User from "../models/User.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

const uploadDir = path.resolve("uploads", "foto")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, name)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/
    const ext = path.extname(file.originalname).toLowerCase()
    if (!allowed.test(ext)) {
      return cb(new Error("Tipo de arquivo não permitido"))
    }
    cb(null, true)
  },
})

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: "Preencha todos os campos." })
    }

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(400).json({ message: "Usuário ou senha inválidos" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Usuário ou senha inválidos" })
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        username: user.username,
        time: user.time || "SemTime",
      },
      process.env.JWT_SECRET || "segredo123",
      { expiresIn: "8h" }
    )

    res.json({
      message: "Login realizado com sucesso!",
      token,
      user: {
        id: user._id,
        username: user.username,
        nome: user.nome,
        role: user.role,
        time: user.time,
        foto: user.foto || null,
      },
    })
  } catch (err) {
    console.error("Erro no /login:", err)
    res.status(500).json({ message: "Erro interno no servidor." })
  }
})

router.post("/register", async (req, res) => {
  try {
    const { username, nome, password, role, time } = req.body

    if (!username || !password || !time) {
      return res.status(400).json({ message: "Preencha todos os campos obrigatórios." })
    }

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ message: "Usuário já existe." })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      username,
      nome,
      password: hashedPassword,
      role: role || "user",
      time,
    })

    await newUser.save()

    res.status(201).json({
      message: "Usuário registrado com sucesso!",
      user: {
        id: newUser._id,
        username: newUser.username,
        nome: newUser.nome,
        role: newUser.role,
        time: newUser.time,
      },
    })
  } catch (err) {
    console.error("Erro no /register:", err)
    res.status(500).json({ message: "Erro ao registrar usuário." })
  }
})

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const u = req.user
    res.json({
      id: u._id,
      nome: u.nome,
      time: u.time,
      username: u.username,
      role: u.role,
      foto: u.foto || null,
    })
  } catch (err) {
    console.error("Erro em /me:", err)
    res.status(500).json({ message: "Erro interno." })
  }
})

router.post(
  "/upload/foto",
  authMiddleware,
  upload.single("foto"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" })
      }

      const userId = req.user._id
      const newFotoPath = `/uploads/foto/${req.file.filename}`

      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" })
      }

      if (user.foto) {
        const oldPath = path.join(uploadDir, path.basename(user.foto))
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }

      user.foto = newFotoPath
      await user.save({ validateBeforeSave: false })

      const updatedUser = await User.findById(userId).select("-password")

      res.json({
        message: "✅ Foto atualizada com sucesso!",
        user: updatedUser,
      })
    } catch (err) {
      console.error("❌ Erro no upload de foto:", err)
      res.status(500).json({
        message: "Erro interno ao processar a foto.",
        error: err.message,
      })
    }
  }
)

export default router

