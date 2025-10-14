// models/Calendario.js
const mongoose = require('mongoose');

const CalendarioSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  adversario: { type: String },
  data: { type: Date, required: true }, // Armazenar como Date
  hora: { type: String }, // Manter como string "HH:MM"
  local: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Calendario', CalendarioSchema);