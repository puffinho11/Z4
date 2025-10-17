const mongoose = require('mongoose')

const ExameSchema = new mongoose.Schema({
  atleta: { type: String, required: true },
  tipo: { type: String, required: true },
  resultado: { type: String },
  data: { type: String, required: true }, 
  obs: { type: String },
  time: { type: mongoose.Schema.Types.ObjectId, ref: 'Time', required: true, },
}, { timestamps: true })

module.exports = mongoose.model('Exame', ExameSchema)