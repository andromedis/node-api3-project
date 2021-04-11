// Imports
const express = require('express');
const userRouter = require('./users/users-router')
const mw = require('./middleware/middleware')

const server = express();

// remember express by default cannot parse JSON in request bodies

// global middlewares and the user's router need to be connected here

server.use(express.json())
server.use(mw.logger)

server.use('/api/users', userRouter)

server.get('/', (req, res) => {
    res.send(`<h2>Let's write some middleware!</h2>`);
});

module.exports = server;
