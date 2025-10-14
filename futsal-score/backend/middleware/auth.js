// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // O token geralmente vem no header 'Authorization: Bearer <token>'
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

  // Checa se o token existe
  if (!token) {
    return res.status(401).json({ msg: 'Nenhum token, autorização negada.' });
  }

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adiciona o usuário do payload ao objeto req
    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(401).json({ msg: 'Token inválido.' });
  }
};