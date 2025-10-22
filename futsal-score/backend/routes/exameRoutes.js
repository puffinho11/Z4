// backend/routes/exameRoutes.js
import express from "express"
import Exame from "../models/Exame.js"
import auth from "../middleware/auth.js" 

const router = express.Router()

// Rota POST: Cria ou Atualiza Exame
router.post("/", auth, async (req, res) => {
  const { id, atleta, tipo, resultado, data, obs, time, solicitante } = req.body 

  try {
    // Verificação preventiva de campos essenciais
    if (!atleta || !tipo || !data || !time || !solicitante) {
      return res.status(400).json({ msg: "Campos obrigatórios faltando: Atleta, Tipo, Data, Hora ou Solicitante." });
    }

    if (id) {
      // É uma atualização (edição)
      const updateFields = { atleta, tipo, resultado, data, obs, time, solicitante };

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
      // É uma criação (novo exame)
      
      let equipeDoExame = time; // Valor do formulário
      
      // Se o usuário NÃO for Admin e TIVER um time (equipe) definido no seu cadastro, 
      // usamos o time do usuário para salvar o exame (segurança e filtro).
      if (!req.user.isAdmin && req.user.time) {
          equipeDoExame = req.user.time;
      }
      
      const novoExame = new Exame({
        atleta,
        tipo,
        resultado,
        data,
        obs,
        time: equipeDoExame, // Salva o exame com a equipe
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

// Rota GET: Buscar exames (FILTRO CORRIGIDO E ROBUSTO)
router.get("/", auth, async (req, res) => {
  try {
    let query = {}
    // req.user.time vem do DB via auth.js
    const userTime = req.user.time; 

    // Log para depuração no console do backend
    console.log("➡️ Usuário logado para busca:", { 
      id: req.user._id, 
      isAdmin: req.user.isAdmin, 
      time: userTime // VALOR CRÍTICO: VERIFIQUE este valor no seu console!
    });

    if (!req.user.isAdmin) {
      // Se o usuário não-admin não tem 'time' ou é vazio, retorna lista vazia.
      if (!userTime || userTime === "") {
         console.warn(`⚠️ Usuário não-admin não tem 'time' definido no cadastro. Retornando lista vazia.`);
         return res.json([]);
      }
      
      // SOLUÇÃO: Usar $regex e 'i' para busca insensível a maiúsculas/minúsculas.
      query = { time: { $regex: new RegExp(userTime, 'i') } };
    } 
    
    const exames = await Exame.find(query).sort({ data: -1, createdAt: -1 })
    
    console.log(`✅ Busca executada. Filtro (query): ${JSON.stringify(query)}. Exames encontrados: ${exames.length}`);
    
    res.json(exames)
  } catch (err) {
    console.error("Erro ao buscar exames:", err)
    res.status(500).send("Erro no Servidor")
  }
})

// Rota DELETE: Excluir exame
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
