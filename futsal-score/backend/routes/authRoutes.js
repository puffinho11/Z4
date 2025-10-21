import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js"; 

const router = express.Router();

const uploadDir = path.resolve("uploads", "foto"); 
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.test(ext)) return cb(new Error("Tipo de arquivo não permitido"));
    cb(null, true);
  },
});

router.post("/register", async (req, res) => {
  try {
    const { username, nome, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Usuário e senha são obrigatórios" });

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "Usuário já existe" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      nome: nome || username,
      password: hashed,
      role: role || "user",
    });

    await user.save();

    const safeUser = {
      id: user._id,
      username: user.username,
      nome: user.nome,
      role: user.role,
    };

    res.status(201).json({ message: "Usuário criado", user: safeUser });
  } catch (err) {
    console.error("Erro no /register:", err);
    res.status(500).json({ message: "Erro interno" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Usuário e senha são obrigatórios" });

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Usuário não encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Senha incorreta" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "segredo123",
      { expiresIn: "8h" }
    );

    res.json({
      message: "Autenticado",
      token,
      user: {
        id: user._id,
        username: user.username,
        nome: user.nome,
        role: user.role,
        foto: user.foto || null,
      },
    });
  } catch (err) {
    console.error("Erro no /login:", err);
    res.status(500).json({ message: "Erro interno" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {

    const u = req.user;
    res.json({
      id: u._id,
      username: u.username,
      nome: u.nome,
      role: u.role,
      foto: u.foto || null,
    });
  } catch (err) {
    console.error("Erro em /me:", err);
    res.status(500).json({ message: "Erro interno" });
  }
});

router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ message: "Nome é obrigatório" });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { nome },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    res.json({ message: "Perfil atualizado", user });
  } catch (err) {
    console.error("Erro em PUT /me:", err);
    res.status(500).json({ message: "Erro interno" });
  }
});

router.post("/upload/foto", authMiddleware, upload.single("foto"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Arquivo não enviado" });

    const fileName = req.file.filename;
    const fileUrl = `/uploads/foto/${fileName}`; 

    const user = await User.findByIdAndUpdate(req.user._id, { foto: fileUrl }, { new: true }).select("-password");

    res.json({ message: "Upload concluído", url: fileUrl, user });
  } catch (err) {
    console.error("Erro no upload:", err);
    res.status(500).json({ message: "Erro ao enviar arquivo" });
  }
})


export default router;




