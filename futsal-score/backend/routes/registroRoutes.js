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

function isSuperAdminUser(user) {
  const role = getUserRole(user)

  return role === "superadmin" || user?.isSuperAdmin === true
}

function getUserTime(user) {
  return user?.time?._id || user?.time?.id || user?.time || null
}

function criarFiltroDoUsuario(user) {
  if (isSuperAdminUser(user)) return {}

  const userId = getUserId(user)
  const time = getUserTime(user)

  if (time) {
    return {
      $or: [
        { time },
        {
          criadoPor: userId,
          $or: [
            { time: { $exists: false } },
            { time: null },
            { time: "" },
            { time: "Sem time" },
          ],
        },
      ],
    }
  }

  return { criadoPor: userId }
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

      // O time sempre vem do usuário autenticado.
      time: getUserTime(user) || "Sem time",
    })

    await novoRegistro.save()

    res.status(201).json(novoRegistro)
  } catch (error) {
    console.error("Erro ao criar registro:", error)

    res.status(500).json({
      msg: "Erro interno ao criar registro.",
    })
  }
})

router.get("/", auth, async (req, res) => {
  try {
    const user = req.user
    const userId = getUserId(user)

    if (!userId) {
      return res.status(401).json({
        msg: "Usuário não identificado.",
      })
    }

    const query = criarFiltroDoUsuario(user)

    const registros = await Registro.find(query).sort({
      data: -1,
      createdAt: -1,
    })

    res.json(registros)
  } catch (error) {
    console.error("Erro ao carregar registros:", error)

    res.status(500).json({
      msg: "Erro ao carregar registros.",
    })
  }
})

router.put("/:id", auth, upload.single("foto"), async (req, res) => {
  try {
    const user = req.user
    const userId = getUserId(user)
    const isSuperAdmin = isSuperAdminUser(user)
    const { id } = req.params

    const registro = await Registro.findOne({
      _id: id,
      ...criarFiltroDoUsuario(user),
    })

    if (!registro) {
      return res.status(404).json({
        msg: "Registro não encontrado.",
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

    if (!isSuperAdmin) {
      dadosAtualizados.criadoPor = registro.criadoPor || userId
      dadosAtualizados.time =
        getUserTime(user) || registro.time || "Sem time"
    }

    const atualizado = await Registro.findByIdAndUpdate(
      id,
      dadosAtualizados,
      {
        new: true,
      }
    )

    res.json(atualizado)
  } catch (error) {
    console.error("Erro ao atualizar registro:", error)

    res.status(500).json({
      msg: "Erro interno ao atualizar registro.",
    })
  }
})

router.delete("/:id", auth, async (req, res) => {
  try {
    const user = req.user
    const { id } = req.params

    const registro = await Registro.findOne({
      _id: id,
      ...criarFiltroDoUsuario(user),
    })

    if (!registro) {
      return res.status(404).json({
        msg: "Registro não encontrado.",
      })
    }

    await Registro.findByIdAndDelete(id)

    res.json({
      msg: "Registro removido com sucesso.",
    })
  } catch (error) {
    console.error("Erro ao deletar registro:", error)

    res.status(500).json({
      msg: "Erro interno ao deletar registro.",
    })
  }
})

export default router