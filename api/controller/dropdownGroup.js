const express = require('express')
const router = express.Router()
const DropdownGroup = require('../models/dropdownGroup')
const validateToken = require('../middleware/validate-token')

router.post('/', (req, res, next) => {
    try {
        const dropdownGroup = new DropdownGroup(req?.body)
        dropdownGroup.save().then(result => {
            res.status(200).json({
                status: true,
                message: "Dropdown group added successfully"
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
                    message: errors.length > 0 ? errors?.[0] : errors
                })
            }
            res.status(500).json({
                status: false,
                message: "Error while adding dropdown group"
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
        DropdownGroup.find({ deleted: false }).populate('orgId').exec().then(result => {
            if (result?.length) {
                return res.status(200).json({
                    status: true,
                    message: "Dropdown group data",
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
                message: "Error while fetching dropdown group"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
})
router.get('/:id', (req, res, next) => {
    try {
        const id = req?.params?.id
        DropdownGroup.find({ _id: id, deleted: false }).populate('orgId').exec().then(result => {
            if (result?.length) {
                return res.status(200).json({
                    status: true,
                    message: "Dropdown group data",
                    data: result.length ? result[0] : []
                })
            }
            res.status(400).json({
                status: false,
                message: "Invalid id Or it's already deleted",
            })

        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while fetching dropdown group"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
})

router.put('/:id', (req, res, next) => {
    try {
        const id = req?.params?.id
        DropdownGroup.findOneAndUpdate({ _id: id, deleted: false }, req?.body, { runValidators: true }).then(result => {
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: "Dropdown group update successfully",
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
                    message: errors.length > 0 ? errors?.[0] : errors
                })
            }
            res.status(500).json({
                status: false,
                message: "Error while updating dropdown group"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
})

router.delete('/:id', (req, res, next) => {
    try {
        const id = req?.params?.id
        DropdownGroup.findOneAndUpdate({ _id: id, deleted: false }, { deleted: true }).then(result => {
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: "Dropdown group deleted successfully",
                })
            }
            res.status(400).json({
                status: false,
                message: "Invalid id Or it's already deleted",
            })
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while deleting dropdown group"
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