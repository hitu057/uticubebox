const mongoose = require('mongoose')

const timeTableSchema = new mongoose.Schema({
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'organization', required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    timeRange: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: true },
    week: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: true },
    deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false })

module.exports = mongoose.model('timeTable', timeTableSchema)