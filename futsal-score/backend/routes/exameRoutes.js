import express from "express"
import Exame from "../models/Exame.js"
import auth from "../middleware/auth.js" 

const router = express.Router()

router.post("/", auth, async (req, res) => {
  const { id, atleta, tipo, resultado, data, obs, time, solicitante } = req.body 

  try {

    if (!atleta || !tipo || !data || !time || !solicitante) {
      return res.status(400).json({ msg: "Campos obrigatórios faltando: Atleta, Tipo, Data, Hora ou Solicitante." })
    }

    if (id) {

      const updateFields = { atleta, tipo, resultado, data, obs, time, solicitante }

      const exame = await Exame.findByIdAndUpdate(
        id,
        updateFields, 
        { new: true, runValidators: true } 
      );

      if (!exame) {
        return res.status(404).json({ msg: "Exame não encontrado." })
      }
      return res.json(exame)
    
    } else {
      
      let equipeDoExame = time
      
      if (!req.user.isAdmin && req.user.time) {
          equipeDoExame = req.user.time;
      }
      
      const novoExame = new Exame({
        atleta,
        tipo,
        resultado,
        data,
        obs,
        time: equipeDoExame, 
        solicitante, 
      })

      const exame = await novoExame.save()
      return res.status(201).json(exame)
    }
  } catch (err) {
    console.error("Erro ao salvar exame:", err)
    if (err.name === 'ValidationError') {
        return res.status(400).json({ msg: "Erro de validação: " + err.message, details: err.errors })
    }
    res.status(500).send("Erro no Servidor")
  }
})

router.get("/", auth, async (req, res) => {
  try {
    let query = {}
    const userTime = req.user.time; 

    console.log("➡️ Usuário logado para busca:", { 
      id: req.user._id, 
      isAdmin: req.user.isAdmin, 
      time: userTime 
    })

    if (!req.user.isAdmin && userTime) {
      query = { time: { $regex: new RegExp(userTime, 'i') } }
    }

    const exames = await Exame.find(query).sort({ data: -1, createdAt: -1 })
    
    console.log(`✅ Busca executada. Filtro (query): ${JSON.stringify(query)}. Exames encontrados: ${exames.length}`)
    
    res.json(exames)
  } catch (err) {
    console.error("Erro ao buscar exames:", err)
    res.status(500).send("Erro no Servidor")
  }
})

router.delete("/:id", auth, async (req, res) => {
  try {
    const exame = await Exame.findByIdAndDelete(req.params.id)

    if (!exame) {
      return res.status(404).json({ msg: "Exame não encontrado." })
    }

    res.json({ msg: "Exame excluído com sucesso!" })
  } catch (err) {
    console.error("Erro ao excluir exame:", err)
    res.status(500).send("Erro no Servidor")
  }
})

export default router

