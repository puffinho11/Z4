const express = require('express')
const router = express.Router()
const Calendario = require('../models/Calendario')
const auth = require('../middleware/auth') 

router.post('/', auth, async (req, res) => {
  const { id, titulo, adversario, data, hora, local } = req.body

  try {
    if (id) {
      let evento = await Calendario.findById(id)
      if (!evento) {
        return res.status(404).json({ msg: 'Evento não encontrado' })
      }
      
      const novosDados = { titulo, adversario, data, hora, local }

      evento = await Calendario.findByIdAndUpdate(id, { $set: novosDados }, { new: true })
      return res.json(evento)
    } else {
      const novoEvento = new Calendario({ titulo, adversario, data, hora, local })
      const evento = await novoEvento.save()
      return res.status(201).json(evento)
    }
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Erro no Servidor')
  }
})

router.get('/', auth, async (req, res) => {
  try {
    const eventos = await Calendario.find().sort({ data: 1, hora: 1 })
    res.json(eventos)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Erro no Servidor')
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    const evento = await Calendario.findById(req.params.id)

    if (!evento) {
      return res.status(404).json({ msg: 'Evento não encontrado' })
    }

    await evento.deleteOne()
    res.json({ msg: 'Evento removido.' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Erro no Servidor')
  }
router.get('/', auth, async (req, res) => {
  try {
    const registros = await Registro.find({ time: req.timeId }).sort({ data: -1 })
    res.json(registros)
  } catch (err) {}
})

router.post('/', auth, async (req, res) => {
  const { nome, categoria, status, treinos, lesoes, vo2, data, gols, amarelos, vermelhos } = req.body;
  
  try {
    const novoRegistro = new Registro({
      nome, categoria, status, treinos, lesoes, vo2, data, gols, amarelos, vermelhos,
      time: req.timeId, 
    })
  } catch (err) { }
})

router.put('/:id', auth, async (req, res) => {
  const { id } = req.params
  const atualizacoes = req.body

  try {
    const registro = await Registro.findOneAndUpdate(
      { _id: id, time: req.timeId },
      { $set: atualizacoes },
      { new: true }
    );
    
    if (!registro) {
      return res.status(404).json({ msg: 'Registro não encontrado ou não pertence ao seu time.' })
    }

  } catch (err) { }
})
})

module.exports = router