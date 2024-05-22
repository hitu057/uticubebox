const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema({
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'organization', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: true },
    deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false })

module.exports = mongoose.model('attendance', attendanceSchema)