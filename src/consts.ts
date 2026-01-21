import path from "node:path";

export const PORT = process.env.PORT ?? 8080;
export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID as string;
export const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET as string;
export const REDIRECT_URI = process.env.REDIRECT_URI as string;
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const UI_PATH = path.join(process.cwd(), 'dist', 'ui');

export const cookieName = 'auth_token'