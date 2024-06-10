const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'organization', required: true },
    email: { type: String, required: true, unique: true, match: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/ },
    password: { type: String },
    mobile: { type: Number, required: true, unique: true },
    firstname: { type: String, required: true },
    middelname: { type: String },
    lastname: { type: String, required: true },
    userType: { type: String, enum: [process?.env?.STUDENT, process?.env?.FACULTY] },
    profile: { type: String },
    address: { type: String, required: true },
    gender: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: true },
    dob: { type: Date },
    // faculty
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: function () { return this.userType === process?.env?.FACULTY } },
    designation: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: function () { return this.userType === process?.env?.FACULTY } },
    empId: { type: String, required: function () { return this.userType === process?.env?.FACULTY } },
    qualification: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: function () { return this.userType === process?.env?.FACULTY } },
    additionalRes: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown' },
    // student
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: function () { return this.userType === process?.env?.STUDENT } },
    addmissionBatch: [{
        batch: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: function () { return this.userType === process?.env?.STUDENT } },
        class: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdown', required: function () { return this.userType === process?.env?.STUDENT } }
    }],
    fatherName: { type: String, required: function () { return this.userType === process?.env?.STUDENT } },
    fatherMobile: { type: Number },
    motherName: { type: String },
    motherMobile: { type: Number },
    parentEmail: { type: String, match: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/ },
    hostel: { type: String },
    guardianName: { type: String },
    guardianMobile: { type: Number },
    roomNumber: { type: Number },
    deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false })

module.exports = mongoose.model('user', userSchema)