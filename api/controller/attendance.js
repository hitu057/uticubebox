const express = require('express')
const router = express.Router()
const Attendance = require('../models/attendance')
const User = require('../models/user')
const validateToken = require('../middleware/validate-token')
const faceapi = require('face-api.js')
const canvas = require('canvas')
const path = require('path')
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
const MODEL_URL = path.join(__dirname, '../../models')
let modelsLoaded = false
const fileDestination = require('../../config/fileUpload')
const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg']
const upload = fileDestination(process.env.COMPAREIMAGE, allowedMimes)
const fs = require('fs')
const { ObjectId } = require('mongodb')

router.post('/viewAttendance', validateToken, (req, res, next) => {
    try {
        Attendance.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(req.body.startdate), $lte: new Date(req.body.enddate) },
                    deleted: false,
                    class: new ObjectId(req?.body?.classId),
                    orgId: new ObjectId(req?.body?.orgId)
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
                message: "Attendance data",
                data: result
            })
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while fetching attendance"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
})

router.patch('/markManualAttendance', validateToken, (req, res, next) => {
    try {
        Attendance.updateOne({ _id: req?.body?._id, deleted: false }, { attendanceData: req?.body?.attendanceData }).then(result => {
            if (result?.matchedCount > 0) {
                return res.status(200).json({
                    status: true,
                    message: `Attendance marked successfully`
                })
            }
            res.status(500).json({
                status: false,
                message: `Session not found`
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
    upload.single('profile')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err
            })
        }
        if (req?.file?.filename) {
            try {
                const image1Path = path.join(__dirname, '../../images/user/' + req?.body?.image)
                const image2Path = path.join(__dirname, '../../compare-image/' + req?.file?.filename)
                compareFaces(image1Path, image2Path).then(isMatch => {
                    fs.unlink(image2Path, (err => {
                        if (err)
                            console.log(err)
                    }))
                    if (!isMatch) {
                        return res.status(500).json({
                            status: false,
                            message: 'Face not matched'
                        })
                    }
                    Attendance.updateOne({ 'attendanceData._id': req?.body?.id, deleted: false },
                        {
                            $set: {
                                'attendanceData.$[elem].attendanceStatus': true
                            }
                        },
                        { arrayFilters: [{ 'elem._id': req?.body?.id }] }).then(result => {
                            if (result?.matchedCount > 0) {
                                return res.status(200).json({
                                    status: true,
                                    message: `Attendance marked successfully`
                                })
                            }
                            res.status(500).json({
                                status: false,
                                message: `Session not found`
                            })
                        }).catch(err => {
                            res.status(500).json({
                                status: false,
                                message: `Error while marking attendance`
                            })
                        })
                }).catch(err => {
                    fs.unlink(image2Path, (err => {
                        if (err)
                            console.log(err)
                    }))
                    res.status(500).json({
                        status: false,
                        message: "Error while comparing face"
                    })
                })
            } catch (error) {
                res.status(500).json({
                    status: false,
                    message: "Something went wrong"
                })
            }
        }
        else {
            res.status(500).json({
                status: false,
                message: "Image not found"
            })
        }
    })
})

router.post('/startAttendance', validateToken, (req, res, next) => {
    try {
        const today = new Date()?.toISOString()?.split('T')?.[0]
        const classId = req?.body?.class
        const batchId = req?.body?.batch
        Attendance.find({ addedAt: today, class: classId, timeRange: req?.body?.timeRange, faculty: req?.body?.faculty, batch: batchId, department: req?.body?.department }).then(result => {
            if (result?.length == 0) {
                User.find({ deleted: false, userType: process?.env?.STUDENT, 'addmissionBatch.class': classId, 'addmissionBatch.batch': batchId }).then(student => {
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
                                message: "Session started successfully"
                            })
                        }).catch(err => {
                            res.status(500).json({
                                status: false,
                                message: "Error while starting session"
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
                        message: "Error while starting session"
                    })
                })
            }
            else {
                Attendance.find({ deleted: true, addedAt: today, class: classId, timeRange: req?.body?.timeRange, faculty: req?.body?.faculty, batch: batchId, department: req?.body?.department }).then(result => {
                    if (result?.length > 0) {
                        Attendance.updateOne({ _id: result?.[0]?._id }, { deleted: false }).then(response => {
                            res.status(200).json({
                                status: true,
                                message: "Session started successfully"
                            })
                        }).catch(err => {
                            res.status(500).json({
                                status: false,
                                message: "Error while starting session"
                            })
                        })
                    }
                    else {
                        res.status(200).json({
                            status: true,
                            message: "Session already started"
                        })
                    }
                }).catch(err => {
                    res.status(500).json({
                        status: false,
                        message: "Error while fetching session"
                    })
                })
            }
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while fetching session"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
})

router.post('/stopAttendance', validateToken, (req, res, next) => {
    try {
        const today = new Date()?.toISOString()?.split('T')?.[0]
        const classId = req?.body?.class
        const batchId = req?.body?.batch
        Attendance.find({ addedAt: today, deleted: false, class: classId, timeRange: req?.body?.timeRange, faculty: req?.body?.faculty, batch: batchId, department: req?.body?.department }).then(result => {
            if (result?.length) {
                Attendance.findByIdAndUpdate({ _id: result?.[0]?._id }, { deleted: true }).then(response => {
                    res.status(200).json({
                        status: true,
                        message: "Session stopped successfully"
                    })
                }).catch(err => {
                    res.status(500).json({
                        status: false,
                        message: "Error while stopping attendance"
                    })
                })
            }
            else {
                res.status(400).json({
                    status: false,
                    message: "Session not found"
                })
            }
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while fetching session"
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
        Attendance.find({ addedAt: today, deleted: false, class: req?.body?.class, timeRange: req?.body?.timeRange, faculty: req?.body?.faculty, batch: req?.body?.batch, department: req?.body?.department }, { _id: 1, attendanceData: 1 }).populate({ path: 'attendanceData.student', select: 'firstname middelname lastname profile rollNumber'}).then(result => {
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

async function loadModels() {
    if (!modelsLoaded) {
        try {
            await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_URL)
            await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL)
            await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL)
            modelsLoaded = true
        } catch (error) {
            throw error
        }
    }
}

async function loadImage(imagePath) {
    const img = await canvas.loadImage(imagePath)
    const canvasInstance = canvas.createCanvas(224, 224)
    const ctx = canvasInstance.getContext('2d')
    ctx.drawImage(img, 0, 0, 224, 224)
    return canvasInstance
}

async function compareFaces(image1Path, image2Path) {
    try {
        await loadModels()
        const img1 = await loadImage(image1Path)
        const img2 = await loadImage(image2Path)
        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        const detections1 = await faceapi.detectAllFaces(img1, options).withFaceLandmarks().withFaceDescriptors()
        const detections2 = await faceapi.detectAllFaces(img2, options).withFaceLandmarks().withFaceDescriptors()
        if (!detections1?.length || !detections2?.length) {
            return false
        }
        const faceMatcher = new faceapi.FaceMatcher(detections1)
        const bestMatch = detections2?.map(fd => faceMatcher?.findBestMatch(fd?.descriptor))
        const threshold = 0.6
        const isMatch = bestMatch.some(match => match.distance < threshold)
        return isMatch
    } catch (error) {
        return false
    }
}

module.exports = router