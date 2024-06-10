require("dotenv").config()
const express = require('express')
const bodyParser = require('body-parser')
const organizationCnt = require('./api/controller/organization')
const dropdownCnt = require('./api/controller/dropdown')
const dropdownGrpCnt = require('./api/controller/dropdownGroup')
const userCnt = require('./api/controller/user')
const timeTable = require('./api/controller/timeTable')
const attendance = require('./api/controller/attendance')
const app = express()
require('./config/database')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/images', express.static('images'))
app.use('/organization', organizationCnt)
app.use('/dropdowngroup', dropdownGrpCnt)
app.use('/dropdown', dropdownCnt)
app.use('/user', userCnt)
app.use('/timetable', timeTable)
app.use('/attendance', attendance)
app.use((req, res, next) => {
    res.status(404).json({
        status: false,
        message: "Api not found"
    })
})

module.exports = app