import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import multer from "multer"
import path from "path"
import fs from "fs"
import User from "../models/User.js" 
import authMiddleware from "../middleware/auth.js" 

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
    cb(null, name);
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/
    const ext = path.extname(file.originalname).toLowerCase()
    if (!allowed.test(ext)) return cb(new Error("Tipo de arquivo não permitido"))
    cb(null, true);
  },
})

router.post("/register", async (req, res) => {
  
})

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(400).json({ message: "Usuário ou senha inválidos" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Usuário ou senha inválidos" })
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET || "segredo123",
      { expiresIn: "8h" }
    )

    res.json({
      message: "Autenticado com sucesso",
      token,
      user: {
        id: user._id,
        username: user.username,
        nome: user.nome,
        role: user.role,
        time: user.time || null,
        foto: user.foto || null,
      },
    })
  } catch (err) {
    console.error("Erro no /login:\r\n", err)
    res.status(500).json({ message: "Erro interno" })
  }
})

router.get("/me", authMiddleware, async (req, res) => { 
  try {
    const u = req.user 
    
    res.json({
      id: u._id, 
      nome: u.nome,
      time: u.time,
      isAdmin: u.role === 'admin',
      username: u.username, 
      role: u.role,        
      foto: u.foto || null, 
    })
  } catch (err) {
    console.error("Erro em /me:", err)
    res.status(500).json({ message: "Erro interno" })
  }
})

router.post("/upload/foto", authMiddleware, upload.single("foto"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Nenhum arquivo enviado" })

    const userId = req.user._id
    const newFotoPath = `/uploads/foto/${req.file.filename}`

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" })

    if (user.foto) {
      const oldPath = path.join(uploadDir, path.basename(user.foto))
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath)
      }
    }

    user.foto = newFotoPath
    await user.save()

    const updatedUser = await User.findById(userId).select('-password')

    res.json({ 
      message: "Foto atualizada com sucesso", 
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        nome: updatedUser.nome,
        role: updatedUser.role,
        time: updatedUser.time || null,
        foto: updatedUser.foto || null,
      }
    })
  } catch (err) {
    console.error("Erro no upload de foto:", err)
    res.status(500).json({ message: "Erro interno ao processar a foto." })
  }
})

export default router