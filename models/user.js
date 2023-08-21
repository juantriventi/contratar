const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  fullName: String,
  username: String,
  password: String,
  profession: String,
  profileImage: String,
  price: Number,
  contact: String,
  email: String,
  description: String,
  ofertas: {
    type: Array,
    default: [],
  },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
