const mongoose = require('mongoose')

const orgSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false })

module.exports = mongoose.model('organization', orgSchema)