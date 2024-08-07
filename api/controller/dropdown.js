const express = require('express')
const router = express.Router()
const Dropdown = require('../models/dropdown')
const validateToken = require('../middleware/validate-token')

router.post('/', validateToken, (req, res, next) => {
    try {
        const dropdown = new Dropdown(req?.body)
        dropdown.save().then(result => {
            res.status(200).json({
                status: true,
                message: "Dropdown added successfully"
            })
        }).catch(err => {
            if (err?.code === 11000 || err?.code === 11001) {
                return res.status(400).json({
                    status: false,
                    message: err?.message
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
                message: "Error while adding dropdown"
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
        Dropdown.find({ deleted: false }, { deleted: 0, createdAt: 0, orgId: 0 }).then(result => {
            return res.status(200).json({
                status: true,
                message: "Dropdown data",
                data: result
            })
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while fetching dropdown"
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
        Dropdown.find({ _id: id, deleted: false }, { deleted: 0, createdAt: 0, orgId: 0 }).then(result => {
            if (result?.length) {
                return res.status(200).json({
                    status: true,
                    message: "Dropdown data",
                    data: result?.[0]
                })
            }
            res.status(400).json({
                status: false,
                message: "Invalid id Or it's already deleted",
            })

        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while fetching dropdown"
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
        Dropdown.findOneAndUpdate({ _id: id, deleted: false }, req?.body, { runValidators: true }).then(result => {
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: "Dropdown update successfully",
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
                message: "Error while updating dropdown"
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
        Dropdown.findOneAndUpdate({ _id: id, deleted: false }, { deleted: true }).then(result => {
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: "Dropdown deleted successfully",
                })
            }
            res.status(400).json({
                status: false,
                message: "Invalid id Or it's already deleted",
            })
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while deleting dropdown"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
})

router.get('/group/:id', validateToken, (req, res, next) => {
    try {
        const groupName = req?.params?.id
        Dropdown.find({ groupName: groupName, deleted: false }, { _id: 1, name: 1 }).then(result => {
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: "Dropdown group data",
                    data: result
                })
            }
            res.status(400).json({
                status: false,
                message: "Invalid group name"
            })
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while fetching dropdown"
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