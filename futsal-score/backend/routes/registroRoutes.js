import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import Registro from "../models/Registro.js"
import auth from "../middleware/auth.js"

const router = express.Router()

const uploadDir = "uploads/registros"

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

function getUserId(user) {
  return user?._id || user?.id || user?.userId
}

function getUserRole(user) {
  return (
    user?.role?.toLowerCase?.() ||
    user?.nivel?.toLowerCase?.() ||
    user?.tipo?.toLowerCase?.() ||
    ""
  )
}

function isUserAdmin(user) {
  const role = getUserRole(user)
  return role === "admin" || user?.isAdmin === true
}

router.post("/", auth, upload.single("foto"), async (req, res) => {
  try {
    const user = req.user
    const userId = getUserId(user)
    const isAdmin = isUserAdmin(user)

    if (!userId) {
      return res.status(401).json({
        msg: "Usuário não identificado. Faça login novamente.",
      })
    }

    const novoRegistro = new Registro({
      ...req.body,
      foto: req.file ? `/uploads/registros/${req.file.filename}` : req.body.foto || "",
      criadoPor: userId,
      time: user.time || req.body.time || null,
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
    const userId = getUserId(user)
    const isAdmin = isUserAdmin(user)

    let query = {}

    if (!isAdmin) {
      query = {
        $or: [
          { criadoPor: userId },
          { time: user.time },
        ],
      }
    }

    const registros = await Registro.find(query).sort({ data: -1, createdAt: -1 })

    res.json(registros)
  } catch (error) {
    console.error("Erro ao carregar registros:", error)
    res.status(500).json({ msg: "Erro ao carregar registros." })
  }
})

router.put("/:id", auth, upload.single("foto"), async (req, res) => {
  try {
    const user = req.user
    const userId = getUserId(user)
    const isAdmin = isUserAdmin(user)
    const { id } = req.params

    const registro = await Registro.findById(id)

    if (!registro) {
      return res.status(404).json({ msg: "Registro não encontrado." })
    }

    const mesmoCriador =
      registro.criadoPor && String(registro.criadoPor) === String(userId)

    const mesmoTime =
      registro.time && user.time && String(registro.time) === String(user.time)

    if (!isAdmin && !mesmoCriador && !mesmoTime) {
      return res.status(403).json({
        msg: "Sem permissão para editar este registro.",
      })
    }

    const dadosAtualizados = {
      ...req.body,
    }

    if (req.file) {
      dadosAtualizados.foto = `/uploads/registros/${req.file.filename}`
    }

    if (!isAdmin) {
      dadosAtualizados.criadoPor = registro.criadoPor || userId
      dadosAtualizados.time = registro.time || user.time || null
    }

    const atualizado = await Registro.findByIdAndUpdate(id, dadosAtualizados, {
      new: true,
    })

    res.json(atualizado)
  } catch (error) {
    console.error("Erro ao atualizar registro:", error)
    res.status(500).json({ msg: "Erro interno ao atualizar registro." })
  }
})

router.delete("/:id", auth, async (req, res) => {
  try {
    const user = req.user
    const userId = getUserId(user)
    const isAdmin = isUserAdmin(user)
    const { id } = req.params

    const registro = await Registro.findById(id)

    if (!registro) {
      return res.status(404).json({ msg: "Registro não encontrado." })
    }

    const mesmoCriador =
      registro.criadoPor && String(registro.criadoPor) === String(userId)

    const mesmoTime =
      registro.time && user.time && String(registro.time) === String(user.time)

    if (!isAdmin && !mesmoCriador && !mesmoTime) {
      return res.status(403).json({
        msg: "Sem permissão para excluir este registro.",
      })
    }

    if (registro.foto && registro.foto.startsWith("/uploads/registros/")) {
      const fotoPath = path.join(process.cwd(), registro.foto)

      if (fs.existsSync(fotoPath)) {
        fs.unlinkSync(fotoPath)
      }
    }

    await Registro.findByIdAndDelete(id)

    res.json({ msg: "Registro removido com sucesso." })
  } catch (error) {
    console.error("Erro ao deletar registro:", error)
    res.status(500).json({ msg: "Erro interno ao deletar registro." })
  }
})

export default router
