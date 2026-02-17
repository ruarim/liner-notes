import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { COOKIE_NAME } from './consts';
import { SessionData } from './types';

export interface AuthenticatedRequest extends Request {
    user?: SessionData;
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).send('Unauthorized');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as SessionData;
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie(COOKIE_NAME);
        return res.status(403).send('Invalid Session');
    }
};