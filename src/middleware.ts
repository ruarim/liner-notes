import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { cookieName } from './consts';

interface JWTPayload {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    spotifyId: string;
}

export interface AuthenticatedRequest extends Request {
    user?: JWTPayload;
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.auth_token; 
    if (!token) return res.status(401).send('Unauthorized');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie(cookieName);
        return res.status(403).send('Invalid Session');
    }
};