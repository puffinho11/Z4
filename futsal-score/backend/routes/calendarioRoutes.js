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
      return res.json(evento);
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
})

module.exports = router