const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  homeScore: { type: Number, default: 0 },
  awayScore: { type: Number, default: 0 },
  events: [{
    minute: Number,
    type: String, // 'goal', 'yellow', 'red', etc.
    playerName: String,
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Match', MatchSchema);
