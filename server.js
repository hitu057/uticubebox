const http = require('http')
const app = require('./app')
const server = http.createServer(app)

server.listen(process.env.PORT, console.log('App is working on ' + process.env.PORT))