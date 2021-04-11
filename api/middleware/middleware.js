// Imports
const Users = require('../users/users-model')


// Custom middleware functions
function logger(req, res, next) {
    console.log(`[${new Date().toISOString()}] ${req.method} to ${req.url}`)
    next()
}

async function validateUserId(req, res, next) {
    try {
        const user = await Users.getById(req.params.id)
        if (user) {
            req.user = user
            next()
        }
        else {
            res.status(404).json({ message: 'user not found' })
        }
    }
    catch (err) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
}

function validateUser(req, res, next) {
    if (req.body.name) {
        next()
    }
    else {
        res.status(400).json({ message: 'missing required name field' })
    }
}

function validatePost(req, res, next) {
    if (req.body.text) {
        next()
    }
    else {
        res.status(500).json({ message: 'missing required text field' })
    }
}


// Exports
module.exports = {
    logger,
    validateUserId,
    validateUser,
    validatePost
}
