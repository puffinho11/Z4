import express from "express"
import Calendario from "../models/Calendario.js"
import auth from "../middleware/auth.js"

const router = express.Router()

// Função robusta de verificação de admin (CRÍTICA)
const checkIsAdmin = (user) => {
    const role =
      user.role?.toLowerCase?.() ||
      user.nivel?.toLowerCase?.() ||
      user.tipo?.toLowerCase?.() ||
      "";
    return role === "admin" || user.isAdmin === true;
};


// ✅ Criar ou atualizar evento (Garante que o campo 'time' não seja nulo para admin)
router.post("/", auth, async (req, res) => {
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
        { new: true }
      )
      if (!evento) {
        return res.status(404).json({ msg: "Evento não encontrado." })
      }
      return res.json(evento)
    }

    // Lógica de criação (POST)
    const novoEvento = new Calendario({
      titulo,
      adversario: adversario || "", 
      data,
      hora,
      local,
      time: eventoTime,
    })

    const evento = await novoEvento.save()
    return res.status(201).json(evento)

  } catch (err) {
    console.error("Erro ao criar/atualizar evento:", err)
    res.status(500).json({ msg: "Erro no servidor ao salvar evento." })
  }
})

// ✅ Listar eventos (CORRIGIDO: Permissão Robustas + Busca com objeto Date)
router.get("/", auth, async (req, res) => {
  try {
    const user = req.user
    const isAdmin = checkIsAdmin(user)

    let query = {}
    
    // 1. Filtro de Permissão
    if (!isAdmin) {
        query.time = user.time
    }

    // 2. CORREÇÃO CRÍTICA DO DATE: Cria um objeto Date para a consulta.
    const today = new Date();
    // Garante que a busca seja do início do dia (00:00:00.000) no fuso horário do servidor,
    // o que é a maneira correta de comparar com o campo 'type: Date' do MongoDB.
    today.setHours(0, 0, 0, 0); 
    
    // Busca eventos cuja data seja MAIOR ou IGUAL ao início do dia atual.
    query.data = { $gte: today } 

    const eventos = await Calendario.find(query).sort({ data: 1, hora: 1 })
    res.json(eventos)
  } catch (err) {
    console.error("Erro ao carregar eventos:", err)
    res.status(500).json({ msg: "Erro no servidor ao carregar eventos." })
  }
})

// ✅ Deletar evento (mantida corrigida por consistência)
router.delete("/:id", auth, async (req, res) => {
  try {
    const evento = await Calendario.findById(req.params.id)

    if (!evento) {
      return res.status(404).json({ msg: "Evento não encontrado." })
    }

    const user = req.user
    const isAdmin = checkIsAdmin(user)

    if (!isAdmin && evento.time !== user.time) {
        return res.status(403).json({ msg: "Sem permissão para excluir este evento." })
    }

    await evento.deleteOne()
    res.json({ msg: "Evento removido com sucesso." })
  } catch (err) {
    console.error("Erro ao deletar evento:", err)
    res.status(500).json({ msg: "Erro no servidor ao deletar evento." })
  }
})

export default router