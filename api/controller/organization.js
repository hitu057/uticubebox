const express = require('express')
const router = express.Router()
const Organization = require('../models/organization')
const validateToken = require('../middleware/validate-token')

router.post('/', validateToken, (req, res, next) => {
    try {
        const org = new Organization(req?.body)
        org.save().then(result => {
            res.status(200).json({
                status: true,
                message: "Organization added successfully"
            })
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while adding organization"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
})

router.get('/', (req, res, next) => {
    try {
        Organization.find({}, { deleted: 0, createdAt: 0 }).then(result => {
            res.status(200).json({
                status: true,
                message: "Organization data",
                data: result
            })
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while fetching organization"
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