const mongoose = require('mongoose')

const dropdownGrpSchema = new mongoose.Schema({
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'organization', required: true },
    name: { type: String, required: true, unique: true },
    deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false })

module.exports = mongoose.model('dropdownGroup', dropdownGrpSchema)