// routes/registroRoutes.js
const express = require('express');
const router = express.Router();
const Registro = require('../models/Registro');
const auth = require('../middleware/auth'); // Proteger a rota

// Rotas para /api/registros

// @route   POST api/registros
// @desc    Criar/Atualizar um registro (Substitui Registro.jsx -> handleSubmit)
// @access  Private
router.post('/', auth, async (req, res) => {
  const { id, nome, categoria, status, treinos, lesoes, vo2, data, gols, amarelos, vermelhos } = req.body;

  try {
    if (id) {
      // ATUALIZAR
      let registro = await Registro.findById(id);
      if (!registro) {
        return res.status(404).json({ msg: 'Registro não encontrado' });
      }
      
      const novosDados = { nome, categoria, status, treinos, lesoes, vo2, data, gols, amarelos, vermelhos };

      registro = await Registro.findByIdAndUpdate(id, { $set: novosDados }, { new: true });
      return res.json(registro);
    } else {
      // CRIAR NOVO
      const novoRegistro = new Registro({ nome, categoria, status, treinos, lesoes, vo2, data, gols, amarelos, vermelhos });
      const registro = await novoRegistro.save();
      return res.status(201).json(registro);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   GET api/registros
// @desc    Obter todos os registros (Substitui Registro.jsx, Dashboard.jsx, Relatorio.jsx, Desempenho.jsx -> useEffect)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Buscar todos os registros, ordenados do mais recente para o mais antigo (data de criação ou campo 'data')
    const registros = await Registro.find().sort({ data: -1, createdAt: -1 }); 
    res.json(registros);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   DELETE api/registros/:id
// @desc    Deletar um registro (Substitui Registro.jsx -> excluir)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const registro = await Registro.findById(req.params.id);

    if (!registro) {
      return res.status(404).json({ msg: 'Registro não encontrado' });
    }

    await registro.deleteOne();
    res.json({ msg: 'Registro removido.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;