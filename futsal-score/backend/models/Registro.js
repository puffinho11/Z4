// models/Registro.js
const mongoose = require('mongoose');

const RegistroSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  categoria: { type: String, required: true },
  status: { type: String, enum: ['OK', 'Recuperação'], default: 'OK' },
  treinos: { type: Number, default: 0 },
  lesoes: { type: Number, default: 0 },
  vo2: { type: Number, default: 0 },
  data: { type: Date, required: true }, // Armazenar como Date
  gols: { type: Number, default: 0 },
  amarelos: { type: Number, default: 0 },
  vermelhos: { type: Number, default: 0 },
  // Adiciona data de criação e atualização automaticamente
}, { timestamps: true });

module.exports = mongoose.model('Registro', RegistroSchema);