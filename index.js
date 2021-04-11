// require your server and launch it
const server = require('./api/server')
const port = 2222

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})