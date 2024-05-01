const mongoose = require('mongoose')

const orgSchema = new mongoose.Schema({
    name: String
}, { versionKey: false })

module.exports = mongoose.model('organization', orgSchema)