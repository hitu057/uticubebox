require("dotenv").config()
const express = require('express')
const bodyParser = require('body-parser')
const organizationCnt = require('./api/controller/organization')
const userCnt = require('./api/controller/user')
const app = express()
require('./config/database')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use('/organization', organizationCnt)
app.use('/user', userCnt)
app.use((req, res, next) => {
    res.status(404).json({
        status: false,
        message: "Api not found"
    })
})

module.exports = app