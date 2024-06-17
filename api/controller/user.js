const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Timetable = require('../models/timeTable')
const fileDestination = require('../../config/fileUpload')
const validateToken = require('../middleware/validate-token')
const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg']
const upload = fileDestination(process.env.USERIMAGES, allowedMimes)

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
        User.findOneAndUpdate({ _id: id, deleted: false, userType: type }, data, { runValidators: true }).then(result => {
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
        else {
            delete req?.body?.password
            updateData(req?.body, id)
        }

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
        User.find({ _id: id, deleted: false, userType: process?.env?.FACULTY }, { deleted: 0, createdAt: 0, orgId: 0, password: 0 }).populate('gender', 'name').populate('department', 'name').populate('designation', 'name').populate('qualification', 'name').populate('additionalRes', 'name').exec().then(result => {
            if (result?.length) {
                result.map(item => {
                    item.profile = item?.profile ? `${process?.env?.USERIMAGES}${item?.profile}` : null
                })
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
        User.find({ deleted: false, userType: process?.env?.FACULTY }, { password: 0, createdAt: 0, orgId: 0, qualification: 0, additionalRes: 0, deleted: 0, addmissionBatch: 0 }).populate('gender', 'name').populate('department', 'name').populate('designation', 'name').exec().then(result => {
            result.map(item => {
                item.profile = item?.profile ? `${process?.env?.USERIMAGES}${item?.profile}` : null
            })
            return res.status(200).json({
                status: true,
                message: "Faculty data",
                data: result
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
        User.find({ deleted: false, userType: process?.env?.STUDENT }, { orgId: 0, password: 0, addmissionBatch: 0, createdAt: 0, deleted: 0, category: 0 }).populate('gender', 'name').exec().then(result => {
            result.map(item => {
                item.profile = item?.profile ? `${process?.env?.USERIMAGES}${item?.profile}` : null
            })
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
}

function getStudentById(req, res, next) {
    try {
        const id = req?.params?.id
        User.find({ _id: id, deleted: false, userType: process?.env?.STUDENT },{deleted:0,createdAt:0,orgId:0,password:0}).populate('gender','name').populate('category','name').populate('addmissionBatch.batch','name').populate('addmissionBatch.class','name').exec().then(result => {
            if (result?.length) {
                result.map(item => {
                    item.profile = item?.profile ? `${process?.env?.USERIMAGES}${item?.profile}` : null
                })
                return res.status(200).json({
                    status: true,
                    message: "Student data",
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

router.put('/faculty/:id', validateToken, (req, res, next) => {
    updateUser(process?.env?.FACULTY, req, res, next)
})

router.delete('/faculty/:id', validateToken, (req, res, next) => {
    deleteUser(process?.env?.FACULTY, req, res, next)
})

router.get('/faculty/:id', validateToken, (req, res, next) => {
    getFacultyById(req, res, next)
})

router.get('/faculty', validateToken, (req, res, next) => {
    getFaculty(req, res, next)
})

router.post('/student', validateToken, (req, res, next) => {
    saveUser(process?.env?.STUDENT, req, res, next)
})

router.post('/validateFaculty', validateToken, (req, res, next) => {
    try {
        User.find({ _id: req?.body?.faculty, orgId: req?.body?.orgId, deleted: false, userType: process?.env?.FACULTY }).then(user => {
            if (!user?.length) {
                return res.status(401).json({
                    status: false,
                    message: "Faculty not exist"
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
                    Timetable.find({ faculty: req?.body?.faculty, class: req?.body?.class, department: req?.body?.department, timeRange: req?.body?.timeRange, orgId: req?.body?.orgId, deleted: false }).then(timetable => {
                        if (timetable?.length) {
                            return res.status(200).json({
                                status: true,
                                message: "Faculty validated successfully"
                            })
                        }
                        res.status(400).json({
                            status: false,
                            message: "Faculty not assigned to any class",
                        })
                    }).catch(err => {
                        res.status(500).json({
                            status: false,
                            message: "Error while validating faculty"
                        })
                    })
                }
                else {
                    res.status(500).json({
                        status: false,
                        message: "Something went wrong"
                    })
                }
            })
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Error while validating faculty"
            })
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
})

router.put('/student/:id', validateToken, (req, res, next) => {
    updateUser(process?.env?.STUDENT, req, res, next)
})

router.delete('/student/:id', validateToken, (req, res, next) => {
    deleteUser(process?.env?.STUDENT, req, res, next)
})

router.get('/student/:id', validateToken, (req, res, next) => {
    getStudentById(req, res, next)
})

router.get('/student', validateToken, (req, res, next) => {
    getStudent(req, res, next)
})

router.patch('/saveUserImage/:id', validateToken, (req, res, next) => {
    upload.single('profile')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err
            })
        }
        const id = req?.params?.id
        if (req?.file?.filename) {
            req.body.profile = req?.file?.filename
            User.findOneAndUpdate({ _id: id, deleted: false }, req?.body, { runValidators: false }).then(result => {
                if (result) {
                    return res.status(200).json({
                        status: true,
                        message: `User profile uploaded successfully`
                    })
                }
                res.status(400).json({
                    status: false,
                    message: "Invalid id Or it's already deleted",
                })
            }).catch(err => {
                res.status(500).json({
                    status: false,
                    message: `Error while updating profile`
                })
            })
        }
        else {
            res.status(200).json({
                status: false,
                message: `Please provide user image`
            })
        }
    })
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
                    const { firstname, middelname, lastname, _id, email, mobile, userType, orgId, profile } = userData
                    const token = jwt.sign({
                        _id,
                        orgId,
                        firstname,
                        middelname,
                        lastname,
                        email,
                        mobile,
                        userType,
                        profile
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