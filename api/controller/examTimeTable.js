const express = require('express')
const router = express.Router()
const ExamTimeTable = require('../models/examTimeTable')
const validateToken = require('../middleware/validate-token')

router.post('/', validateToken, (req, res, next) => {
    try {
        const examTimeTable = new ExamTimeTable(req?.body)
        examTimeTable.save().then(result => {
            res.status(200).json({
                status: true,
                message: "Exam Timetable added successfully"
            })
        }).catch(err => {
            if (err?.code === 11000 || err?.code === 11001) {
                return res.status(400).json({
                    status: false,
                    message: `${err?.message}`
                })
            }
            if (err?.name === 'ValidationError') {
                const errors = Object.values(err?.errors).map(error => error?.message)
                return res.status(400).json({
                    status: false,
                    message: errors?.length > 0 ? errors?.[0] : errors
                })
            }
            res.status(500).json({
                status: false,
                message: "Error while adding exam timetable"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
})

router.get('/', validateToken, (req, res, next) => {
    try {
        ExamTimeTable.find({ deleted: false },{_id:1}).populate('class','name').populate({path: 'faculty',select: 'firstname middelname lastname'}).populate('timeRange','name').populate('department','name').exec().then(result => {
            return res.status(200).json({
                status: true,
                message: "Exam Timetable data",
                data: result.length ? result : []
            })
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while fetching exam timetable"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
})
router.get('/:id', validateToken, (req, res, next) => {
    try {
        const id = req?.params?.id
        ExamTimeTable.find({ _id: id, deleted: false },{deleted:0,createdAt:0,orgId:0}).then(result => {
            if (result?.length) {
                return res.status(200).json({
                    status: true,
                    message: "Exam Timetable data",
                    data: result?.length ? result?.[0] : []
                })
            }
            res.status(400).json({
                status: false,
                message: "Invalid id Or it's already deleted",
            })

        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while fetching exam timetable"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
})

router.put('/:id', validateToken, (req, res, next) => {
    try {
        const id = req?.params?.id
        ExamTimeTable.findOneAndUpdate({ _id: id, deleted: false }, req?.body, { runValidators: true }).then(result => {
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: "Exam Timetable update successfully",
                })
            }
            res.status(400).json({
                status: false,
                message: "Invalid id Or it's already deleted",
            })
        }).catch(err => {
            if (err?.code === 11000 || err?.code === 11001) {
                return res.status(400).json({
                    status: false,
                    message: `${err?.message}`
                })
            }
            if (err?.name === 'ValidationError') {
                const errors = Object.values(err?.errors).map(error => error?.message)
                return res.status(400).json({
                    status: false,
                    message: errors?.length > 0 ? errors?.[0] : errors
                })
            }
            res.status(500).json({
                status: false,
                message: "Error while updating exam timetable"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
})

router.delete('/:id', validateToken, (req, res, next) => {
    try {
        const id = req?.params?.id
        ExamTimeTable.findOneAndUpdate({ _id: id, deleted: false }, { deleted: true }).then(result => {
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: "Exam Timetable deleted successfully",
                })
            }
            res.status(400).json({
                status: false,
                message: "Invalid id Or it's already deleted",
            })
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while deleting exam timetable"
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