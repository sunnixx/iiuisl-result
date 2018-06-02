const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, unique: true, lowercase: true },
  password: { type: String, lowercase: true },
  filepath: { type: String }
});

module.exports = mongoose.model('User', UserSchema);