// Imports
import express, { Express, Request, Response } from 'express';
import { router as userRouter } from './users/users-router';
import * as mw from './middleware/middleware';

export const server = express()

// remember express by default cannot parse JSON in request bodies

// global middlewares and the user's router need to be connected here

server.use(express.json())
server.use(mw.logger)

server.use('/api/users', userRouter)

server.get('/', (req: Request, res: Response) => {
    res.send(`<h2>Let's write some middleware!</h2>`);
});
