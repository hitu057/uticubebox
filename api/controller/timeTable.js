const express = require('express')
const router = express.Router()
const TimeTable = require('../models/timeTable')
const validateToken = require('../middleware/validate-token')

router.post('/', validateToken, (req, res, next) => {
    try {
        const timeTable = new TimeTable(req?.body)
        timeTable.save().then(result => {
            res.status(200).json({
                status: true,
                message: "Timetable added successfully"
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
                message: "Error while adding timetable"
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
        TimeTable.find({ deleted: false }).populate('class').populate('faculty').populate('timeRange').populate('department').populate('week').exec().then(result => {
            return res.status(200).json({
                status: true,
                message: "Timetable data",
                data: result.length ? result : []
            })
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while fetching timetable"
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
        TimeTable.find({ _id: id, deleted: false }).then(result => {
            if (result?.length) {
                return res.status(200).json({
                    status: true,
                    message: "Timetable data",
                    data: result?.length ? result[0] : []
                })
            }
            res.status(400).json({
                status: false,
                message: "Invalid id Or it's already deleted",
            })

        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while fetching timetable"
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
        TimeTable.findOneAndUpdate({ _id: id, deleted: false }, req?.body, { runValidators: true }).then(result => {
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: "Timetable update successfully",
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
                message: "Error while updating timetable"
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
        TimeTable.findOneAndUpdate({ _id: id, deleted: false }, { deleted: true }).then(result => {
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: "Timetable deleted successfully",
                })
            }
            res.status(400).json({
                status: false,
                message: "Invalid id Or it's already deleted",
            })
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while deleting timetable"
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