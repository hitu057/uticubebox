const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'organization' },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: Number, required: true, unique: true },
    password: { type: String },
    userType: String,
    deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false })

module.exports = mongoose.model('user', userSchema)