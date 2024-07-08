const express = require('express')
const router = express.Router()
const Exam = require('../models/exam')
const User = require('../models/user')
const validateToken = require('../middleware/validate-token')

router.patch('/markAttendance', validateToken, (req, res, next) => {
    try {
        Exam.updateOne({ _id: req?.body?._id, deleted: false }, { attendanceData: req?.body?.attendanceData }).then(result => {
            if (result?.matchedCount > 0) {
                return res.status(200).json({
                    status: true,
                    message: `Attendance marked successfully`
                })
            }
            res.status(500).json({
                status: false,
                message: `Error while marking attendance`
            })
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: `Error while marking attendance`
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
})

router.post('/studentAttendance', validateToken, (req, res, next) => {
    try {
        const today = new Date()?.toISOString()?.split('T')?.[0]
        Attendance.find({ addedAt: today, deleted: false, class: req?.body?.class, timeRange: req?.body?.timeRange, faculty: req?.body?.faculty, batch: req?.body?.batch, department: req?.body?.department }, { _id: 1, attendanceData: 1 }).populate({ path: 'attendanceData.student', select: 'firstname middelname lastname profile rollNumber' }).then(result => {
            res.status(200).json({
                status: true,
                message: "Student data",
                data: result
            })
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while fetching student"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
})

router.post('/studentList', validateToken, (req, res, next) => {
    const { classId, batchId } = req?.body
    try {
        User.find({ deleted: false, userType: process?.env?.STUDENT, 'addmissionBatch.class': classId, 'addmissionBatch.batch': batchId }).then(result => {
            res.status(200).json({
                status: true,
                message: "Student data",
                data: result
            })
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while fetching student"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
})

module.exports = router