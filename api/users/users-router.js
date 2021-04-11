// Imports
const express = require('express');
const Users = require('./users-model');
const Posts = require('../posts/posts-model');
const mw = require('../middleware/middleware')


// Express Router instance
const router = express.Router();


// Users endpoints
router.get('/', async (req, res) => {
    // RETURN AN ARRAY WITH ALL THE USERS
    try {
        const users = await Users.get()
        res.status(200).json(users)
    }
    catch (err) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
});

router.get('/:id', mw.validateUserId, (req, res) => {
    // RETURN THE USER OBJECT
    // this needs a middleware to verify user id
    res.status(200).json(req.user)
});

router.post('/', mw.validateUser, async (req, res) => {
    // RETURN THE NEWLY CREATED USER OBJECT
    // this needs a middleware to check that the request body is valid
    try {
        const user = await Users.insert({ name: req.body.name })
        res.status(201).json(user)
    }
    catch (err) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
});

router.put('/:id', mw.validateUserId, mw.validateUser, async (req, res) => {
    // RETURN THE FRESHLY UPDATED USER OBJECT
    // this needs a middleware to verify user id
    // and another middleware to check that the request body is valid
    try {
        const updated = await Users.update(req.params.id, { name: req.body.name })
        if (updated) {
            const user = await Users.getById(req.params.id)
            res.status(200).json(user)
        }
        else
            throw new Error(`User id=${req.params.id} could not be updated`)
    }
    catch (err) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
});

router.delete('/:id', mw.validateUserId, async (req, res) => {
    // RETURN THE FRESHLY DELETED USER OBJECT
    // this needs a middleware to verify user id
    try {
        const deleted = await Users.remove(req.params.id)
        if (deleted)
            res.status(200).json(req.user)
        else
            throw new Error(`User id=${req.params.id} could not be removed`)
    }
    catch (err) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
});

router.get('/:id/posts', mw.validateUserId, async (req, res) => {
    // RETURN THE ARRAY OF USER POSTS
    // this needs a middleware to verify user id
    try {
        const posts = await Users.getUserPosts(req.params.id)
        res.status(200).json(posts)
    }
    catch (err) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
});

router.post('/:id/posts', mw.validateUserId, mw.validatePost, async (req, res) => {
    // RETURN THE NEWLY CREATED USER POST
    // this needs a middleware to verify user id
    // and another middleware to check that the request body is valid
    try {
        const post = await Posts.insert({ text: req.body.text, user_id: req.params.id })
        res.status(201).json(post)
    }
    catch (err) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
});

// Exports
module.exports = router