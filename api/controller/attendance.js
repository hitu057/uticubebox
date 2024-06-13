const express = require('express')
const router = express.Router()
const Attendance = require('../models/attendance')
const User = require('../models/user')
const validateToken = require('../middleware/validate-token')

router.patch('/markManualAttendance', validateToken, (req, res, next) => {
    try {
        Attendance.updateOne({ _id: req?.body?._id }, { attendanceData: req?.body?.attendanceData }).then(result => {
            res.status(200).json({
                status: true,
                message: `Attendance marked successfully`
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

router.patch('/markAutomaticAttendance', validateToken, (req, res, next) => {
    try {
        Attendance.updateOne({ 'attendanceData._id': req?.body?._id },
            {
                $set: {
                    'attendanceData.$[elem].attendanceStatus': req?.body?.attendanceStatus,
                    'attendanceData.$[elem].remark': req?.body?.remark,
                },
            },
            { arrayFilters: [{ 'elem._id': req?.body?._id }] }).then(result => {
                res.status(200).json({
                    status: true,
                    message: `Attendance marked successfully`
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

router.post('/startAttendance', validateToken, (req, res, next) => {
    try {
        const today = new Date()?.toISOString()?.split('T')?.[0]
        const classId = req?.body?.class
        const batch = req?.body?.batch
        Attendance.find({ addedAt: today, deleted: false, class: req?.body?.class, timeRange: req?.body?.timeRange, faculty: req?.body?.faculty, batch: req?.body?.batch, department: req?.body?.department }).then(result => {
            if (result?.length == 0) {
                User.find({ deleted: false, userType: process?.env?.STUDENT, 'addmissionBatch.class': classId, 'addmissionBatch.batch': batch }).then(student => {
                    if (student?.length) {
                        const attendanceData = student.map(item => {
                            return {
                                student: item?._id,
                                remark: "",
                                attendanceStatus: null
                            }
                        })
                        req.body.attendanceData = attendanceData
                        req.body.addedAt = new Date()?.toISOString()?.split('T')?.[0]
                        const attendance = new Attendance(req?.body)
                        attendance.save().then(response => {
                            res.status(200).json({
                                status: true,
                                message: "Attendance started successfully"
                            })
                        }).catch(err => {
                            res.status(500).json({
                                status: false,
                                message: "Error while starting attendance1"
                            })
                        })
                    }
                    else {
                        res.status(400).json({
                            status: false,
                            message: "No student found"
                        })
                    }
                }).catch(err => {
                    res.status(500).json({
                        status: false,
                        message: "Error while starting attendance2"
                    })
                })
            }
            else {
                res.status(200).json({
                    status: true,
                    message: "Attendance already started"
                })
            }
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

router.post('/studentAttendance', validateToken, (req, res, next) => {
    try {
        const today = new Date()?.toISOString()?.split('T')?.[0]
        Attendance.find({ addedAt: today, deleted: false, class: req?.body?.class, timeRange: req?.body?.timeRange, faculty: req?.body?.faculty, batch: req?.body?.batch, department: req?.body?.department }).populate('attendanceData.student').then(result => {
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