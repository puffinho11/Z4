const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ msg: 'Nenhum token, autorização negada.' })
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = decoded.user
    next()
  } catch (e) {
    res.status(401).json({ msg: 'Token inválido.' })
  }
}