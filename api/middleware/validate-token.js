const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        const token = req?.headers?.authorization.split(' ')[1]
        if (token) {
            const verify = jwt?.verify(token, process.env.TOKENKEY)
            verify ? next() : res.status(401).json({
                status: false,
                message: "Provide valid token"
            })
        }
        else {
            res.status(401).json({
                status: false,
                message: "Provide valid token"
            })
        }

    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Provide valid token"
        })
    }
}