const mongoose = require('mongoose')

const CalendarioSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  adversario: { type: String },
  data: { type: String, required: true }, 
  hora: { type: String }, 
  local: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('Calendario', CalendarioSchema)