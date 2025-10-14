const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const auth = require('../middleware/auth');

// Criar partida (protegido)
router.post('/', auth, async (req, res) => {
  try {
    const { date, homeTeam, awayTeam, homeScore = 0, awayScore = 0, events = [] } = req.body;
    const match = new Match({ date, homeTeam, awayTeam, homeScore, awayScore, events });
    await match.save();
    await match.populate('homeTeam awayTeam');
    res.status(201).json(match);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Listar partidas
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find().populate('homeTeam awayTeam').sort({ date: -1 });
    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get partida específica
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate('homeTeam awayTeam');
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json(match);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
