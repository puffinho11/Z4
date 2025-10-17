const mongoose = require('mongoose')

const TimeSchema = new mongoose.Schema({
 
    nome: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  dataCriacao: {
    type: Date,
    default: Date.now,
  },

})

module.exports = mongoose.model('Time', TimeSchema)