const mongoose = require('mongoose')

const hallTicketSchema = new mongoose.Schema({
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'organization', required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: true },
    studentData: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        isEligible: { type: Boolean, default: true }
    }],
    deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false })

module.exports = mongoose.model('hallTicket', hallTicketSchema)