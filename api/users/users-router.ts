// Imports
import express, { Request, Response, Router } from 'express';
import * as UserModel from './users-model';
import * as PostModel from '../posts/posts-model';
import * as mw from '../middleware/middleware';
import { BaseUser, User } from './user.interface';
import { BasePost, Post } from '../posts/post.interface';


// Express Router instance
export const router = express.Router();


// Users endpoints
router.get('/', async (req: Request, res: Response) => {
    // RETURN AN ARRAY WITH ALL THE USERS
    try {
        const users: User[] = await UserModel.get()
        res.status(200).json(users)
    }
    catch (err: any) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
});

router.get('/:id', mw.validateUserId, (req: Request, res: Response) => {
    // RETURN THE USER OBJECT
    // this needs a middleware to verify user id
    res.status(200).json(res.locals.user)
});

router.post('/', mw.validateUser, async (req: Request, res: Response) => {
    // RETURN THE NEWLY CREATED USER OBJECT
    // this needs a middleware to check that the request body is valid
    try {
        const user: User | undefined = await UserModel.insert({ name: req.body.name })
        res.status(201).json(user)
    }
    catch (err: any) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
});

router.put('/:id', mw.validateUserId, mw.validateUser, async (req: Request, res: Response) => {
    // RETURN THE FRESHLY UPDATED USER OBJECT
    // this needs a middleware to verify user id
    // and another middleware to check that the request body is valid
    const id: User['id'] = parseInt(req.params.id, 10)
    try {
        const updated: number = await UserModel.update(id, { name: req.body.name })
        if (updated) {
            const user: User | undefined = await UserModel.getById(id)
            res.status(200).json(user)
        }
        else
            throw new Error(`User id=${id} could not be updated`)
    }
    catch (err: any) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
});

router.delete('/:id', mw.validateUserId, async (req: Request, res: Response) => {
    // RETURN THE FRESHLY DELETED USER OBJECT
    // this needs a middleware to verify user id
    const id: User['id'] = parseInt(req.params.id, 10)
    try {
        const deleted: number = await UserModel.remove(id)
        if (deleted)
            res.status(200).json(res.locals.user)
        else
            throw new Error(`User id=${id} could not be removed`)
    }
    catch (err: any) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
});

router.get('/:id/posts', mw.validateUserId, async (req: Request, res: Response) => {
    // RETURN THE ARRAY OF USER POSTS
    // this needs a middleware to verify user id
    const id: User['id'] = parseInt(req.params.id, 10)
    try {
        const posts: Post[] = await UserModel.getUserPosts(id)
        res.status(200).json(posts)
    }
    catch (err: any) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
});

router.post('/:id/posts', mw.validateUserId, mw.validatePost, async (req: Request, res: Response) => {
    // RETURN THE NEWLY CREATED USER POST
    // this needs a middleware to verify user id
    // and another middleware to check that the request body is valid
    const user_id: User['id'] = parseInt(req.params.id, 10)
    try {
        const post: Post | undefined = await PostModel.insert({ text: req.body.text, user_id })
        res.status(201).json(post)
    }
    catch (err: any) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
});
