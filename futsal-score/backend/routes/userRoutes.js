// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth'); // Middleware de autenticação

// @route   POST api/users/login
// @desc    Autenticar usuário e obter token (Substitui LoginModal.jsx -> handleSubmit)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Procurar usuário
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciais inválidas.' });
    }

    // 2. Comparar senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciais inválidas.' });
    }

    // 3. Gerar JWT
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
      { expiresIn: '5h' }, // Token expira em 5 horas
      (err, token) => {
        if (err) throw err;
        // Retorna o token e os dados do usuário
        res.json({ token, user: payload.user });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   POST api/users/
// @desc    Criar/Atualizar usuário (Substitui Admin.jsx -> handleSubmit)
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Acesso negado: Requer papel de admin.' });
  }

  const { username, password, role } = req.body;

  if (!username || !password || !role) {
      return res.status(400).json({ msg: 'Todos os campos são obrigatórios.' });
  }

  try {
    let user = await User.findOne({ username });

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (user) {
      // Atualizar usuário existente
      user.password = hashedPassword;
      user.role = role;
      await user.save();
      return res.json({ msg: 'Usuário atualizado com sucesso!', user });
    } else {
      // Criar novo usuário
      user = new User({ username, password: hashedPassword, role });
      await user.save();
      return res.json({ msg: 'Usuário criado com sucesso!', user });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   GET api/users/
// @desc    Listar todos os usuários (Substitui Admin.jsx -> useEffect)
// @access  Private (Admin)
router.get('/', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Acesso negado: Requer papel de admin.' });
    }
    try {
        const users = await User.find().select('-password'); // Não retorna a senha
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no Servidor');
    }
});

// @route   DELETE api/users/:username
// @desc    Deletar um usuário (Substitui Admin.jsx -> deleteUser)
// @access  Private (Admin)
router.delete('/:username', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Acesso negado: Requer papel de admin.' });
    }
    try {
        // Encontra o usuário pelo nome de usuário
        const user = await User.findOne({ username: req.params.username });

        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado.' });
        }

        // Não permite que o admin se auto-exclua se for o único admin (opcional)
        // if (req.user.username === req.params.username) {
        //     return res.status(400).json({ msg: 'Não pode remover a própria conta.' });
        // }

        await user.deleteOne();
        res.json({ msg: 'Usuário removido.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no Servidor');
    }
});

module.exports = router;