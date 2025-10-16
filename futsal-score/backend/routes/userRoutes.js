const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {

    let user = await User.findOne({ username })
    if (!user) {
      return res.status(400).json({ msg: 'Credenciais inválidas.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciais inválidas.' })
    }

    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: payload.user })
      }
    )
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Erro no Servidor')
  }
})

router.post('/register', async (req, res) => {
    const { username, password, role } = req.body

    const finalRole = (role === 'admin' || role === 'user') ? role : 'user';

    if (!username || !password) {
        return res.status(400).json({ msg: 'Usuário e senha são obrigatórios.' })
    }

    try {
        let user = await User.findOne({ username })

        if (user) {
            return res.status(400).json({ msg: 'Nome de usuário já existe.' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        user = new User({ username, password: hashedPassword, role: finalRole })
        await user.save()

        const payload = { user: { id: user.id, username: user.username, role: user.role } }
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ msg: 'Usuário criado com sucesso!', token, user: payload.user })
        })

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Erro no Servidor')
    }
})

router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Acesso negado: Requer papel de admin.' })
  }

  const { username, password, role } = req.body

  if (!username || !role) {
      return res.status(400).json({ msg: 'Usuário e papel são obrigatórios.' })
  }

  try {
    let user = await User.findOne({ username })

    if (user) {
        if(password) {
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt)
        }
        user.role = role
        await user.save()
        return res.json({ msg: 'Usuário atualizado com sucesso!', user })
    } 
    else {
        if (!password) {
             return res.status(400).json({ msg: 'Senha é obrigatória para criar novo usuário.' })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        
        user = new User({ username, password: hashedPassword, role })
        await user.save()
        return res.json({ msg: 'Usuário criado com sucesso!', user })
    }
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Erro no Servidor')
  }
});

router.get('/', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Acesso negado: Requer papel de admin.' })
    }
    try {
        const users = await User.find().select('-password')
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no Servidor')
    }
})

router.delete('/:username', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Acesso negado: Requer papel de admin.' })
    }
    try {

        const user = await User.findOne({ username: req.params.username })

        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado.' })
        }

        await user.deleteOne()
        res.json({ msg: 'Usuário removido.' })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Erro no Servidor')
    }
})

module.exports = router