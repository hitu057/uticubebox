const express = require('express')
const router = express.Router()
const HallTicket = require('../models/hallTicket')
const Attendance = require('../models/attendance')
const validateToken = require('../middleware/validate-token')
const mongoose = require('mongoose')

router.post('/studentList', validateToken, (req, res, next) => {
    try {
        Attendance.aggregate([
            {
                $match: {
                    deleted: false,
                    class: new mongoose.Types.ObjectId(req?.body?.class),
                    batch: new mongoose.Types.ObjectId(req?.body?.batch),
                    orgId: new mongoose.Types.ObjectId(req?.body?.orgId)
                }
            },
            { $unwind: "$attendanceData" },
            {
                $group: {
                    _id: "$attendanceData.student",
                    totalClasses: { $sum: 1 },
                    presentClasses: {
                        $sum: { $cond: ["$attendanceData.attendanceStatus", 1, 0] }
                    }
                }
            },
            {
                $project: {
                    student: "$_id",
                    totalClasses: 1,
                    presentClasses: 1,
                    attendancePercentage: {
                        $multiply: [
                            { $divide: ["$presentClasses", "$totalClasses"] },
                            100
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "student",
                    foreignField: "_id",
                    as: "studentDetails"
                }
            },
            { $unwind: "$studentDetails" },
            {
                $project: {
                    _id: 0,
                    studentId: "$student",
                    studentFirstName: "$studentDetails.firstname",
                    studentMiddleName: "$studentDetails.middelname",
                    studentLastName: "$studentDetails.lastname",
                    studentRollNumber: "$studentDetails.rollNumber",
                    totalClasses: 1,
                    presentClasses: 1,
                    attendancePercentage: { $round: ["$attendancePercentage", 2] }
                }
            }
        ]).then(result => {
            res.status(200).json({
                status: true,
                message: "Student data",
                data: result
            })
        }).catch(err => {
            console.log(err)
            res.status(500).json({
                status: false,
                message: "Error while fetching student data"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
})

router.post('/generateHallTicket', validateToken, (req, res, next) => {
    try {
        HallTicket.find({ class: req?.body?.class, batch: req?.body?.batch, orgId: req?.body?.orgId }).then(result => {
            if (result?.length === 0) {
                const hallTicket = new HallTicket(req?.body)
                hallTicket.save().then(response => {
                    res.status(200).json({
                        status: true,
                        message: "Hall ticket generated successfully"
                    })
                }).catch(err => {
                    res.status(500).json({
                        status: false,
                        message: "Error while generating hall ticket"
                    })
                })
            }
            else {
                res.status(200).json({
                    status: true,
                    message: "Hall ticket already generated"
                })
            }
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while checking hall ticket"
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