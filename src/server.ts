import 'dotenv/config';
import express from 'express';

import { closeMongo, connectMongo } from './mongodb';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, JWT_SECRET, PORT, UI_PATH } from './consts';
import cookieParser from 'cookie-parser';
import { authenticateJWT } from './middleware';
import * as Controller from './controller';


const app = express();

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !JWT_SECRET) {
    console.error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env file");
    process.exit(1);
}

app.set('trust proxy', 1); // trust the first hop (the load balancer)
app.use(cookieParser());
app.use(express.static(UI_PATH));

app.get('/auth', Controller.auth);
app.get('/callback', Controller.callback);
app.get('/logout', Controller.logout);

app.get('/api/history', authenticateJWT, Controller.history);
app.get('/api/now-playing', authenticateJWT, Controller.nowPlaying)
app.get('/api/recently-played', authenticateJWT, Controller.recentlyPlayed)
app.post('/api/analyse', authenticateJWT, Controller.analyse);
app.get('/api/related-tracks', authenticateJWT, Controller.relatedTracks)

const startServer = async () => {
    await connectMongo();
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

startServer();

process.on('SIGINT', async () => {
    await closeMongo();
    process.exit(0);
});