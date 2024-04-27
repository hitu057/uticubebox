require("dotenv").config()
const cors = require('cors')
const express = require("express")
const app = express()
app.use(express.json())
app.use(cors({
    origin: '*'
}))
app.get('/', (req, res) => {
    res.send('Hello, World!')
})
app.listen(process.env.PORT, () => {
    console.log("server is running on PORT", process.env.PORT)
})
