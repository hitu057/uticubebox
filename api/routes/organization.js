const express = require('express')
const router = express.Router()

router.get('/', (req, res, next) => {
    res.status(200).json({
        status: true,
        message: "All Organization"
    })
})

module.exports = router