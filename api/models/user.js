const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: Number,
    password: String,
    userType: String
})

module.exports = mongoose.model('user', userSchema)