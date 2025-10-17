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