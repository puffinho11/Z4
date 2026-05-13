import express from "express"
import multer from "multer"
import Registro from "../models/Registro.js"
import auth from "../middleware/auth.js"

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

function getUserId(user) {
  return user?._id || user?.id || user?.userId || null
}

function getUserRole(user) {
  return (
    user?.role?.toLowerCase?.() ||
    user?.nivel?.toLowerCase?.() ||
    user?.tipo?.toLowerCase?.() ||
    ""
  )
}

function isAdminUser(user) {
  const role = getUserRole(user)
  return role === "admin" || user?.isAdmin === true
}

function converterFotoBase64(file) {
  if (!file) return ""
  const mimeType = file.mimetype
  const base64 = file.buffer.toString("base64")
  return `data:${mimeType};base64,${base64}`
}

router.post("/", auth, upload.single("foto"), async (req, res) => {
  try {
    const user = req.user
    const userId = getUserId(user)

    if (!userId) {
      return res.status(401).json({
        msg: "Usuário não identificado. Faça login novamente.",
      })
    }

    const novoRegistro = new Registro({
      nome: req.body.nome,
      cpf: req.body.cpf,
      dataNascimento: req.body.dataNascimento,
      sexo: req.body.sexo,
      categoria: req.body.categoria,
      status: req.body.status || "OK",
      treinos: Number(req.body.treinos) || 0,
      lesoes: Number(req.body.lesoes) || 0,
      vo2: Number(req.body.vo2) || 0,
      data: req.body.data || Date.now(),
      gols: Number(req.body.gols) || 0,
      amarelos: Number(req.body.amarelos) || 0,
      vermelhos: Number(req.body.vermelhos) || 0,
      foto: converterFotoBase64(req.file),
      criadoPor: userId,
      time: user.time || req.body.time || "Sem time",
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
    const isAdmin = isAdminUser(user)

    let query = {}

    if (!isAdmin) {
      query = {
        $or: [
          { criadoPor: userId },
          { time: user.time },
          { time: "Sem time" },
          { time: null },
          { time: "" },
          { time: "Todos" },
        ],
      }
    }

    const registros = await Registro.find(query).sort({
      data: -1,
      createdAt: -1,
    })

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
    const isAdmin = isAdminUser(user)
    const { id } = req.params

    const registro = await Registro.findById(id)

    if (!registro) {
      return res.status(404).json({ msg: "Registro não encontrado." })
    }

    const mesmoCriador =
      registro.criadoPor && String(registro.criadoPor) === String(userId)

    const mesmoTime =
      registro.time && user.time && String(registro.time) === String(user.time)

    const registroSemTime =
      !registro.time ||
      registro.time === "" ||
      registro.time === "Todos" ||
      registro.time === "Sem time"

    if (!isAdmin && !mesmoCriador && !mesmoTime && !registroSemTime) {
      return res.status(403).json({
        msg: "Sem permissão para editar este registro.",
      })
    }

    const dadosAtualizados = {
      nome: req.body.nome,
      cpf: req.body.cpf,
      dataNascimento: req.body.dataNascimento,
      sexo: req.body.sexo,
      categoria: req.body.categoria,
      status: req.body.status || "OK",
      treinos: Number(req.body.treinos) || 0,
      lesoes: Number(req.body.lesoes) || 0,
      vo2: Number(req.body.vo2) || 0,
      data: req.body.data || registro.data,
      gols: Number(req.body.gols) || 0,
      amarelos: Number(req.body.amarelos) || 0,
      vermelhos: Number(req.body.vermelhos) || 0,
    }

    if (req.file) {
      dadosAtualizados.foto = converterFotoBase64(req.file)
    }

    if (!isAdmin) {
      dadosAtualizados.criadoPor = registro.criadoPor || userId
      dadosAtualizados.time = registro.time || user.time || "Sem time"
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
    const isAdmin = isAdminUser(user)
    const { id } = req.params

    const registro = await Registro.findById(id)

    if (!registro) {
      return res.status(404).json({ msg: "Registro não encontrado." })
    }

    const mesmoCriador =
      registro.criadoPor && String(registro.criadoPor) === String(userId)

    const mesmoTime =
      registro.time && user.time && String(registro.time) === String(user.time)

    const registroSemTime =
      !registro.time ||
      registro.time === "" ||
      registro.time === "Todos" ||
      registro.time === "Sem time"

    if (!isAdmin && !mesmoCriador && !mesmoTime && !registroSemTime) {
      return res.status(403).json({
        msg: "Sem permissão para excluir este registro.",
      })
    }

    await Registro.findByIdAndDelete(id)

    res.json({ msg: "Registro removido com sucesso." })
  } catch (error) {
    console.error("Erro ao deletar registro:", error)
    res.status(500).json({ msg: "Erro interno ao deletar registro." })
  }
})

export default router