const express = require('express');
const router = express.Router();
const Time = require('../models/Time');
const auth = require('../middleware/auth');

// @route   POST /api/times
// @desc    Criar um novo time (apenas Super Admin)
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
  // Você pode criar uma nova role 'superadmin' ou deixar admin fazer isso por enquanto
  if (req.user.role !== 'admin') { 
    return res.status(403).json({ msg: 'Acesso negado: Requer papel de admin.' });
  }

  const { nome } = req.body;
  if (!nome) return res.status(400).json({ msg: 'O nome do time é obrigatório.' });

  try {
    let time = await Time.findOne({ nome });
    if (time) return res.status(400).json({ msg: 'Time já existe.' });

    time = new Time({ nome });
    await time.save();
    res.json({ msg: 'Time criado com sucesso!', time });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   GET /api/times
// @desc    Listar todos os times (apenas Admin)
// @access  Private (Admin)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    // Um usuário normal deve ver apenas o próprio time, o Admin vê todos
    return res.status(403).json({ msg: 'Acesso negado: Requer papel de admin.' });
  }
  try {
    const times = await Time.find().sort({ nome: 1 });
    res.json(times);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;