const express = require('express')
const router = express.Router()
const Student = require('../models/user')
const validateToken = require('../middleware/validate-token')

router.get('/student', validateToken, (req, res, next) => {
    try {
        Student.find({ deleted: false }).populate('orgId').populate('category').populate('addmissionBatch').populate('gender').exec().then(result => {
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: "Student data",
                    data: result
                })
            }
            res.status(400).json({
                status: false,
                message: "Invalid id Or it's already deleted",
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