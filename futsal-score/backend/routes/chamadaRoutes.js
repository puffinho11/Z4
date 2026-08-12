import express from "express"
import Chamada from "../models/Chamada.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

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
  return (
    getUserRole(user) === "superadmin" ||
    user?.isSuperAdmin === true
  )
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

router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req.user)
    const time = getUserTime(req.user)
    const { categoria, data, professor, atletas } = req.body

    if (!userId) {
      return res.status(401).json({
        message: "Usuário não identificado.",
      })
    }

    if (
      !categoria ||
      !data ||
      !professor ||
      !Array.isArray(atletas)
    ) {
      return res.status(400).json({
        message: "Campos obrigatórios ausentes.",
      })
    }

    const novaChamada = new Chamada({
      categoria,
      data,
      professor,
      atletas,
      criadoPor: userId,
      time: time || "Sem time",
    })

    await novaChamada.save()

    res.status(201).json(novaChamada)
  } catch (err) {
    console.error("Erro ao criar chamada:", err)

    res.status(500).json({
      message: "Erro ao criar chamada.",
    })
  }
})

router.get("/", authMiddleware, async (req, res) => {
  try {
    const chamadas = await Chamada.find(
      criarFiltroDoUsuario(req.user)
    ).sort({
      createdAt: -1,
    })

    res.json(chamadas)
  } catch (err) {
    console.error("Erro ao buscar chamadas:", err)

    res.status(500).json({
      message: "Erro ao buscar chamadas.",
    })
  }
})

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const chamada = await Chamada.findOne({
      _id: req.params.id,
      ...criarFiltroDoUsuario(req.user),
    })

    if (!chamada) {
      return res.status(404).json({
        message: "Chamada não encontrada.",
      })
    }

    res.json(chamada)
  } catch (err) {
    console.error("Erro ao buscar chamada:", err)

    res.status(500).json({
      message: "Erro ao buscar chamada.",
    })
  }
})

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { categoria, data, professor, atletas } = req.body

    const chamadaAtualizada = await Chamada.findOneAndUpdate(
      {
        _id: req.params.id,
        ...criarFiltroDoUsuario(req.user),
      },
      {
        categoria,
        data,
        professor,
        atletas,
      },
      {
        new: true,
      }
    )

    if (!chamadaAtualizada) {
      return res.status(404).json({
        message: "Chamada não encontrada.",
      })
    }

    res.json(chamadaAtualizada)
  } catch (err) {
    console.error("Erro ao atualizar chamada:", err)

    res.status(500).json({
      message: "Erro ao atualizar chamada.",
    })
  }
})

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const chamadaRemovida = await Chamada.findOneAndDelete({
      _id: req.params.id,
      ...criarFiltroDoUsuario(req.user),
    })

    if (!chamadaRemovida) {
      return res.status(404).json({
        message: "Chamada não encontrada.",
      })
    }

    res.json({
      message: "Chamada excluída com sucesso.",
    })
  } catch (err) {
    console.error("Erro ao excluir chamada:", err)

    res.status(500).json({
      message: "Erro ao excluir chamada.",
    })
  }
})

export default router