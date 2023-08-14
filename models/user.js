const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  profileImage: String,
  price: Number,
  contact: String,
  description: String 
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
