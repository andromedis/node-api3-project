// Imports
import { Request, Response, NextFunction } from 'express';
import * as UserModel from '../users/users-model';
import { BaseUser, User } from '../users/user.interface';
import { BasePost } from '../posts/post.interface';


// Custom middleware functions
export function logger(req: Request, res: Response, next: NextFunction) {
    console.log(`[${new Date().toISOString()}] ${req.method} to ${req.url}`)
    next()
}

export async function validateUserId(req: Request, res: Response, next: NextFunction) {
    const id: User['id'] = parseInt(req.params.id, 10)
    try {
        const user: User | undefined = await UserModel.getById(id)
        if (user) {
            res.locals.user = user
            next()
        }
        else {
            res.status(404).json({ message: 'user not found' })
        }
    }
    catch (err: any) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
}

export function validateUser(req: Request, res: Response, next: NextFunction) {
    const name: BaseUser['name'] | undefined = req.body.name
    if (name) {
        next()
    }
    else {
        res.status(400).json({ message: 'missing required name field' })
    }
}

export function validatePost(req: Request, res: Response, next: NextFunction) {
    const text: BasePost['text'] | undefined = req.body.text
    if (text) {
        next()
    }
    else {
        res.status(400).json({ message: 'missing required text field' })
    }
}
