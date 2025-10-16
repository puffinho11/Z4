const express = require('express')
const router = express.Router()
const Exame = require('../models/Exame')
const auth = require('../middleware/auth')

router.post('/', auth, async (req, res) => {
  const { id, atleta, tipo, resultado, data, obs } = req.body

  try {
    if (id) {
      let exame = await Exame.findById(id)
      if (!exame) {
        return res.status(404).json({ msg: 'Exame não encontrado' })
      }
      
      const novosDados = { atleta, tipo, resultado, data, obs }

      exame = await Exame.findByIdAndUpdate(id, { $set: novosDados }, { new: true })
      return res.json(exame)
    } else {
      const novoExame = new Exame({ atleta, tipo, resultado, data, obs })
      const exame = await novoExame.save()
      return res.status(201).json(exame)
    }
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Erro no Servidor')
  }
})

router.get('/', auth, async (req, res) => {
  try {
    const exames = await Exame.find().sort({ data: -1, createdAt: -1 })
    res.json(exames)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Erro no Servidor')
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    const exame = await Exame.findById(req.params.id)

    if (!exame) {
      return res.status(404).json({ msg: 'Exame não encontrado' })
    }

    await exame.deleteOne()
    res.json({ msg: 'Exame removido.' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Erro no Servidor')
  }
})

module.exports = router