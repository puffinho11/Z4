const mongoose = require('mongoose')

const ExameSchema = new mongoose.Schema({
  atleta: { type: String, required: true },
  tipo: { type: String, required: true },
  resultado: { type: String },
  data: { type: String, required: true }, 
  obs: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('Exame', ExameSchema)