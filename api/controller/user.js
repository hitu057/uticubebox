const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

router.post('/', (req, res, next) => {
    try {
        bcrypt.hash(req?.body?.password, 10, (err, hash) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: "Error while encrytion"
                })
            }
            req.body.password = hash
            const user = new User(req?.body)
            user.save().then(result => {
                res.status(200).json({
                    status: true,
                    message: "User added successfully"
                })
            }).catch(err => {
                res.status(500).json({
                    status: false,
                    message: "Error while adding organization"
                })
            })
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        })
    }
})

router.post('/login', (req, res, next) => {
    try {
        User.find({ email: req?.body?.email }).exec().then(user => {
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
                    const token = jwt.sign({
                        _id: userData?._id,
                        name: userData?.name,
                        email: userData?.email,
                        mobile: userData?.mobile
                    }, 'uticubebox', { expiresIn: '24h' })
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