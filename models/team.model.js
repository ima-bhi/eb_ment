const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  placeholder:String,
  players: [String],
});

module.exports = mongoose.model('Team', teamSchema);
