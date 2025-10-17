const express = require('express')
const router = express.Router()
const Registro = require('../models/Registro')
const auth = require('../middleware/auth')

router.post('/', auth, async (req, res) => {
  const { id, nome, categoria, status, treinos, lesoes, vo2, data, gols, amarelos, vermelhos } = req.body

  try {
    if (id) {
      let registro = await Registro.findById(id);
      if (!registro) {
        return res.status(404).json({ msg: 'Registro não encontrado' })
      }
      
      const novosDados = { nome, categoria, status, treinos, lesoes, vo2, data, gols, amarelos, vermelhos }

      registro = await Registro.findByIdAndUpdate(id, { $set: novosDados }, { new: true })
      return res.json(registro)
    } else {
      const novoRegistro = new Registro({ nome, categoria, status, treinos, lesoes, vo2, data, gols, amarelos, vermelhos })
      const registro = await novoRegistro.save();
      return res.status(201).json(registro)
    }
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Erro no Servidor')
  }
})

router.get('/', auth, async (req, res) => {
  try {
    const registros = await Registro.find().sort({ data: -1, createdAt: -1 })
    res.json(registros)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Erro no Servidor')
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    const registro = await Registro.findById(req.params.id)

    if (!registro) {
      return res.status(404).json({ msg: 'Registro não encontrado' })
    }

    await registro.deleteOne()
    res.json({ msg: 'Registro removido.' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Erro no Servidor')
  }
})

module.exports = router