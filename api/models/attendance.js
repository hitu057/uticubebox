const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema({
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'organization', required: true },
    timeRange: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: true },
    attendanceData: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        remark: { type: String },
        attendanceStatus: { type: Boolean, default: false }
    }],
    deleted: { type: Boolean, default: false },
    addedAt: { type: String},
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false })

module.exports = mongoose.model('attendance', attendanceSchema)