// routes/calendarioRoutes.js (BACKEND CORRIGIDO)

import express from "express"
import Calendario from "../models/Calendario.js"
// ⚠️ CORREÇÃO: Usando 'authMiddleware' - verifique se o seu ficheiro é authMiddleware.js ou auth.js
import authMiddleware from "../middleware/authMiddleware.js" 

const router = express.Router()

// Função robusta de verificação de admin (mantida)
const checkIsAdmin = (user) => {
    const role =
      user.role?.toLowerCase?.() ||
      user.nivel?.toLowerCase?.() ||
      user.tipo?.toLowerCase?.() ||
      "";
    return role === "admin" || user.isAdmin === true;
};


// ✅ Criar ou atualizar evento (POST /api/calendario)
// Usando o authMiddleware corrigido
router.post("/", authMiddleware, async (req, res) => {
  const { id, titulo, adversario, data, hora, local, time } = req.body

  try {
    const user = req.user
    const isAdmin = checkIsAdmin(user)
    
    // Se admin, usa o time do payload ou 'Todos'. Se não, usa o time do usuário.
    const eventoTime = isAdmin 
      ? (time || "Todos") 
      : user.time

    if (!titulo || !data || !hora || !eventoTime) {
      return res.status(400).json({
        msg: "Campos obrigatórios faltando: título, data, hora ou time."
      })
    }

    // Lógica de atualização (PUT)
    if (id) {
      const evento = await Calendario.findByIdAndUpdate(
        id, 
        { titulo, adversario, data, hora, local, time: eventoTime },
        { new: true } // Retorna o documento atualizado
      )
      if (!evento) {
        return res.status(404).json({ msg: "Evento não encontrado para atualização." })
      }
      return res.json(evento)
    }

    // Lógica de criação (POST)
    const novoEvento = new Calendario({ 
      titulo, adversario, data, hora, local, time: eventoTime 
    })
    await novoEvento.save()

    res.status(201).json(novoEvento)
  } catch (err) {
    console.error("Erro ao criar/atualizar evento:", err)
    res.status(500).json({ msg: "Erro no servidor ao criar/atualizar evento." })
  }
})

// ✅ Buscar Próximos Eventos (GET /api/calendario)
// Usando o authMiddleware corrigido
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = req.user
    const isAdmin = checkIsAdmin(user)

    const query = {}
    
    // 1. FILTRO DE TIME (CORRIGIDO)
    if (!isAdmin && user.time) {
      query.time = user.time // Filtra por time se não for admin e o usuário tiver um time
    }

    // 2. FILTRO DE DATA: Busca eventos a partir de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    query.data = { $gte: today } 

    const eventos = await Calendario.find(query).sort({ data: 1, hora: 1 })
    res.json(eventos)
  } catch (err) {
    console.error("Erro ao carregar eventos:", err)
    res.status(500).json({ msg: "Erro no servidor ao carregar eventos." })
  }
})

// ✅ Deletar evento (DELETE /api/calendario/:id)
// Usando o authMiddleware corrigido
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const evento = await Calendario.findById(req.params.id)

    if (!evento) {
      return res.status(404).json({ msg: "Evento não encontrado." })
    }

    const user = req.user
    const isAdmin = checkIsAdmin(user)
    
    // Regra de segurança: só admin/coach/criador pode deletar
    if (!isAdmin && evento.time !== user.time) {
      return res.status(403).json({ msg: "Acesso negado." })
    }

    await Calendario.findByIdAndDelete(req.params.id)

    res.json({ msg: "Evento deletado com sucesso." })
  } catch (err) {
    console.error("Erro ao deletar evento:", err)
    res.status(500).json({ msg: "Erro no servidor ao deletar evento." })
  }
})

export default router