const express = require('express')
const app = express()
const organizationRoute = require('./api/routes/organization')

app.use('/organization', organizationRoute)
app.use((req, res, next) => {
    res.status(200).json({
        status: true,
        message: "App is working"
    })
})

module.exports = app