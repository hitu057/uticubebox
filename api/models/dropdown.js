const mongoose = require('mongoose')

const dropdownSchema = new mongoose.Schema({
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'organization', required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdownGroup', required: true },
    name: { type: String, required: true },
    deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false })

module.exports = mongoose.model('dropdown', dropdownSchema)