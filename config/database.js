const mongoose = require('mongoose')

mongoose.connect(process.env.DATABSE_URL)
mongoose.connection.on('error', err => {
    console.log('Database connection failed')
})
mongoose.connection.on('connected', connected => {
    console.log('Database connected')
})