require("dotenv").config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const organizationRoute = require('./api/routes/organization')

mongoose.connect(process.env.DATABSE_URL)
mongoose.connection.on('error', err => {
    console.log('Database connection failed')
})
mongoose.connection.on('connected', connected => {
    console.log('Database connected')
})

app.use('/organization', organizationRoute)
app.use((req, res, next) => {
    res.status(404).json({
        status: false,
        message: "Api not found"
    })
})

module.exports = app