import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import Registro from "../models/Registro.js"
import auth from "../middleware/auth.js"

const router = express.Router()

const uploadDir = "uploads/registros"
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

router.post("/", auth, upload.single("foto"), async (req, res) => {
  try {
    const user = req.user

    const role =
      user.role?.toLowerCase?.() ||
      user.nivel?.toLowerCase?.() ||
      user.tipo?.toLowerCase?.() ||
      ""
    const isAdmin = role === "admin" || user.isAdmin === true

    if (!isAdmin && !user.time) {
      return res.status(403).json({
        msg: "Seu usuário não está associado a um time. Não é possível registrar.",
      })
    }

    const novoRegistro = new Registro({
      ...req.body,
      foto: req.file ? `/uploads/registros/${req.file.filename}` : "",
      criadoPor: user._id,
      time: isAdmin ? req.body.time || "Todos" : user.time,
    })

    await novoRegistro.save()
    res.status(201).json(novoRegistro)
  } catch (error) {
    console.error("Erro ao criar registro:", error)
    res.status(500).json({ msg: "Erro interno ao criar registro." })
  }
})

router.get("/", auth, async (req, res) => {
  try {
    const user = req.user

    const role =
      user.role?.toLowerCase?.() ||
      user.nivel?.toLowerCase?.() ||
      user.tipo?.toLowerCase?.() ||
      ""
    const isAdmin = role === "admin" || user.isAdmin === true

    let query = {}

    if (!isAdmin) query.time = user.time

    const registros = await Registro.find(query).sort({ data: -1 })
    res.json(registros)
  } catch (error) {
    console.error("Erro ao carregar registros:", error)
    res.status(500).json({ msg: "Erro ao carregar registros." })
  }
})

router.put("/:id", auth, upload.single("foto"), async (req, res) => {
  try {
    const user = req.user
    const { id } = req.params

    const registro = await Registro.findById(id)
    if (!registro) {
      return res.status(404).json({ msg: "Registro não encontrado." })
    }

    const role =
      user.role?.toLowerCase?.() ||
      user.nivel?.toLowerCase?.() ||
      user.tipo?.toLowerCase?.() ||
      ""
    const isAdmin = role === "admin" || user.isAdmin === true

    if (!isAdmin && registro.time !== user.time) {
      return res.status(403).json({ msg: "Sem permissão para editar este registro." })
    }

    const dadosAtualizados = { ...req.body }
    if (req.file) dadosAtualizados.foto = `/uploads/registros/${req.file.filename}`

    const atualizado = await Registro.findByIdAndUpdate(id, dadosAtualizados, { new: true })
    res.json(atualizado)
  } catch (error) {
    console.error("Erro ao atualizar registro:", error)
    res.status(500).json({ msg: "Erro interno ao atualizar registro." })
  }
})

router.delete("/:id", auth, async (req, res) => {
  try {
    const user = req.user
    const { id } = req.params

    const registro = await Registro.findById(id)
    if (!registro) {
      return res.status(404).json({ msg: "Registro não encontrado." })
    }

    const role =
      user.role?.toLowerCase?.() ||
      user.nivel?.toLowerCase?.() ||
      user.tipo?.toLowerCase?.() ||
      ""
    const isAdmin = role === "admin" || user.isAdmin === true

    if (!isAdmin && registro.time !== user.time) {
      return res.status(403).json({ msg: "Sem permissão para excluir este registro." })
    }

    if (registro.foto) {
      const fotoPath = path.join(process.cwd(), registro.foto)
      if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath)
    }

    await Registro.findByIdAndDelete(id)
    res.json({ msg: "Registro removido com sucesso." })
  } catch (error) {
    console.error("Erro ao deletar registro:", error)
    res.status(500).json({ msg: "Erro interno ao deletar registro." })
  }
})

export default router
