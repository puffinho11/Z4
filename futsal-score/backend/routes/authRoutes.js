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
  try {
    const { username, nome, password, role } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Usuário e senha são obrigatórios" })

    const existing = await User.findOne({ username })
    if (existing)
      return res.status(400).json({ message: "Usuário já existe" })

    const hashed = await bcrypt.hash(password, 10)
    const user = new User({
      username,
      nome: nome || username,
      password: hashed,
      role: role || "user",
    })

    await user.save()

    res.status(201).json({
      message: "Usuário criado com sucesso",
      user: {
        id: user._id,
        username: user.username,
        nome: user.nome,
        role: user.role,
      },
    })
  } catch (err) {
    console.error("Erro no /register:", err)
    res.status(500).json({ message: "Erro interno" })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password)
      return res.status(400).json({ message: "Usuário e senha são obrigatórios" })

    const user = await User.findOne({ username })
    if (!user) return res.status(400).json({ message: "Usuário não encontrado" })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).json({ message: "Senha incorreta" })

    const token = jwt.sign(
      {
        id: user._id,
        nome: user.nome,
        time: user.time || null, 
        isAdmin: user.role === "admin",
      },
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
    const u = req.user;
    // ✅ CORREÇÃO: Adicionando os campos que o frontend espera
    res.json({
      id: u.id,
      nome: u.nome,
      time: u.time,
      isAdmin: u.isAdmin,
      username: u.username, // <-- ADICIONADO
      role: u.role,         // <-- ADICIONADO
      foto: u.foto || null, // <-- ADICIONADO
    });
  } catch (err) {
    console.error("Erro em /me:", err);
    res.status(500).json({ message: "Erro interno" });
  }
});

router.post("/upload/foto", authMiddleware, upload.single("foto"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Arquivo não enviado" })

    const fileUrl = `/uploads/foto/${req.file.filename}`
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { foto: fileUrl },
      { new: true }
    ).select("-password")

    res.json({ message: "Upload concluído", url: fileUrl, user })
  } catch (err) {
    console.error("Erro no upload:", err)
    res.status(500).json({ message: "Erro ao enviar arquivo" })
  }
})

export default router





