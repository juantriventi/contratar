const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
});

userSchema.plugin(passportLocalMongoose);

// Exporta el modelo directamente
module.exports = mongoose.model('User', userSchema);
