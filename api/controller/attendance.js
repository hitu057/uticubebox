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
        if (!detections1.length || !detections2.length) {
            return false
        }
        const faceMatcher = new faceapi.FaceMatcher(detections1)
        const bestMatch = detections2.map(fd => faceMatcher.findBestMatch(fd.descriptor))
        const threshold = 0.6 // Adjust this threshold based on your requirements
        const isMatch = bestMatch.some(match => match.distance < threshold)
        return isMatch
    } catch (error) {
        console.error('Error comparing faces:', error)
        return false
    }
}

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

router.patch('/compareFace', validateToken, (req, res, next) => {
    const image1Path = path.join(__dirname, '../../compare-image/1.jpg')
    const image2Path = path.join(__dirname, '../../compare-image/2.jpg')
    compareFaces(image1Path, image2Path).then(isMatch => {
        res.status(200).json({
            status: true,
            message: isMatch ? 'The faces match.' : 'The faces do not match.'
        })
    })
})

router.patch('/markAutomaticAttendance', validateToken, (req, res, next) => {
    try {
        Attendance.updateOne({ 'attendanceData._id': req?.body?._id },
            {
                $set: {
                    'attendanceData.$[elem].attendanceStatus': req?.body?.attendanceStatus,
                    'attendanceData.$[elem].remark': req?.body?.remark,
                }
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