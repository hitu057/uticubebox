const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

function saveUser(type, req, res, next) {
    try {
        bcrypt.hash(req?.body?.password, 10, (err, hash) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: "Error while encrytion"
                })
            }
            req.body.password = hash
            req.body.userType = type
            const user = new User(req?.body)
            user.save().then(result => {
                res.status(200).json({
                    status: true,
                    message: `${type?.charAt(0)?.toUpperCase()}${type?.slice(1)} added successfully`
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
                    message: `Error while adding ${type}`
                })
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
}

function updateUser(type, req, res, next) {
    function updateData(data, id) {
        data.userType = type
        User.findOneAndUpdate({ _id: id, deleted: false, orgId: data?.orgId, userType: type }, data, { runValidators: true }).then(result => {
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: `${type?.charAt(0)?.toUpperCase()}${type?.slice(1)} updated successfully`
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
                message: `Error while updating ${type}`
            })
        })
    }
    try {
        const id = req?.params?.id
        if (req?.body?.password) {
            bcrypt.hash(req?.body?.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        message: "Error while encrytion"
                    })
                }
                req.body.password = hash
                updateData(req?.body, id)
            })
        }
        else
            updateData(req?.body, id)

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
}

function deleteUser(type, req, res, next) {
    try {
        const id = req?.params?.id
        User.findOneAndUpdate({ _id: id, deleted: false, userType: type }, { deleted: true }).then(result => {
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: `${type?.charAt(0)?.toUpperCase()}${type?.slice(1)} deleted successfully`
                })
            }
            res.status(400).json({
                status: false,
                message: "Invalid id Or it's already deleted",
            })
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: `Error while deleting ${type}`
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
}
function getFacultyById(req, res, next) {
    try {
        const id = req?.params?.id
        User.find({ _id: id, deleted: false, userType: process?.env?.FACULTY }).populate('orgId').populate('gender').populate('department').populate('qualification').populate('additionalRes').exec().then(result => {
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: "Faculty data",
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
                message: "Error while fetching faculty"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
}

function getFaculty(req, res, next) {
    try {
        User.find({ deleted: false, userType: process?.env?.FACULTY }).populate('orgId').populate('gender').populate('department').populate('qualification').populate('additionalRes').exec().then(result => {
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: "Faculty data",
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
                message: "Error while fetching faculty"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
}
function getStudent(req, res, next) {
    try {
        User.find({ deleted: false, userType: process?.env?.STUDENT }).populate('orgId').populate('gender').populate('category').populate('addmissionBatch').exec().then(result => {
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: "Student data",
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
                message: "Error while fetching student"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
}

function getStudentById(req, res, next) {
    try {
        const id = req?.params?.id
        User.find({ _id: id, deleted: false, userType: process?.env?.STUDENT }).populate('orgId').populate('gender').populate('category').populate('addmissionBatch').exec().then(result => {
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: "Student data",
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
                message: "Error while fetching student"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
}
router.post('/faculty', (req, res, next) => {
    saveUser(process?.env?.FACULTY, req, res, next)
})

router.put('/faculty/:id', (req, res, next) => {
    updateUser(process?.env?.FACULTY, req, res, next)
})

router.delete('/faculty/:id', (req, res, next) => {
    deleteUser(process?.env?.FACULTY, req, res, next)
})

router.get('/faculty/:id', (req, res, next) => {
    getFacultyById(req, res, next)
})

router.get('/faculty', (req, res, next) => {
    getFaculty(req, res, next)
})

router.post('/student', (req, res, next) => {
    saveUser(process?.env?.STUDENT, req, res, next)
})

router.put('/student/:id', (req, res, next) => {
    updateUser(process?.env?.STUDENT, req, res, next)
})

router.delete('/student/:id', (req, res, next) => {
    deleteUser(process?.env?.STUDENT, req, res, next)
})

router.get('/student/:id', (req, res, next) => {
    getStudentById(req, res, next)
})

router.get('/student', (req, res, next) => {
    getStudent(req, res, next)
})

router.post('/login', (req, res, next) => {
    try {
        User.find({ email: req?.body?.email, orgId: req?.body?.orgId, deleted: false }).exec().then(user => {
            if (!user?.length) {
                return res.status(401).json({
                    status: false,
                    message: "User not exist"
                })
            }
            bcrypt.compare(req?.body?.password, user?.[0]?.password, (err, result) => {
                if (!result) {
                    return res.status(401).json({
                        status: false,
                        message: "Password not match"
                    })
                }
                if (result) {
                    const userData = user?.[0]
                    const { firstname, middelname, lastname, _id, email, mobile, userType, orgId } = userData
                    const token = jwt.sign({
                        _id,
                        orgId,
                        firstname,
                        middelname,
                        lastname,
                        email,
                        mobile,
                        userType
                    }, process.env.TOKENKEY, { expiresIn: '24h' })
                    res.status(200).json({
                        status: true,
                        message: "Login Successfull",
                        token: token
                    })
                }
                else {
                    res.status(500).json({
                        status: false,
                        message: "Something went wrong"
                    })
                }
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