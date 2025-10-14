const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  colorPrimary: { type: String },
  colorSecondary: { type: String },
  players: [{
    name: String,
    number: Number,
    position: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Team', TeamSchema);
