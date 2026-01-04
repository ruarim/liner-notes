import 'dotenv/config';
import express, { Request, Response } from 'express';
import session from 'express-session';
import axios from 'axios';
import querystring from 'querystring';
import path from 'path';

import { SpotifyTokenResponse, TrackData } from './types';
import * as Store from './store';
import * as Spotify from './spotify';
import * as Analysis from './analysis';
import * as Events from "./events";
import redisClient, { connectRedis } from './redis';

declare module 'express-session' {
    interface SessionData {
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
        spotifyId: string;
    }
}

const app = express();
const PORT = process.env.PORT ?? 3000;
const CLIENT_ID = process.env.CLIENT_ID as string;
const CLIENT_SECRET = process.env.CLIENT_SECRET as string;
const REDIRECT_URI = process.env.REDIRECT_URI as string;
const UI_PATH = path.join(process.cwd(), 'dist', 'ui');


if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("Missing CLIENT_ID or CLIENT_SECRET in .env file");
    process.exit(1);
}

app.use(express.static(UI_PATH));
app.use(session({
    secret: process.env.SESSION_SECRET || 'music-expert-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}));


app.get('/login', (_: Request, res: Response) => {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: Spotify.scopes,
        redirect_uri: REDIRECT_URI,
    });
    res.redirect(`${Spotify.authorizeUrl}?${params.toString()}`);
});

app.get('/callback', async (req: Request, res: Response) => {
    const code = req.query.code as string || null;

    try {
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code as string,
            redirect_uri: REDIRECT_URI
        });
        const response = await axios.post<SpotifyTokenResponse>(
            Spotify.tokenUrl,
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
                },
            }
        );

        const userProfile = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${response.data.access_token}` }
        });

        req.session.accessToken = response.data.access_token;
        req.session.refreshToken = response.data.refresh_token;
        req.session.expiresAt = Date.now() + response.data.expires_in * 1000;
        req.session.spotifyId = userProfile.data.id;

        res.redirect('/');
    } catch (error) {
        console.error('Error during authentication', error);
        res.status(500).send('Authentication Error');
    }
});

app.get('/api/history', async (req: Request, res: Response) => {
    const { spotifyId } = req.session;
    if (!spotifyId) return res.status(401).json({ error: 'Unauthorized' });
    const history = await Store.getTrackHistory(spotifyId);
    res.json({ history });
});

app.get('/api/now-playing', async (req: Request, res: Response) => {
    const { accessToken, spotifyId } = req.session;
    if (!accessToken || !spotifyId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    try {
        const track = await Spotify.getCurrentlyPlaying(accessToken)
        if (!track) return res.json(null)
        const trackDetails: TrackData = {
            name: track.name,
            artist: track.artists.map((a: any) => a.name).join(', '),
            image: track.album.images[0]?.url,
            trackId: track.id,
            album: track.album.name,
            releaseDate: track.album.release_date,
            loading: true,
        }
        await Store.pushHistory(spotifyId, track.id);
        let cached = await Store.getCacheTrack(track.id);
        if (cached) {
            res.json(cached);
            return;
        }
        await Store.updateCache(track.id, trackDetails);
        Analysis.generateContent(trackDetails);
        res.json(trackDetails);
    } catch (error: any) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.get('/api/events', (req, res) => {
    const { spotifyId } = req.session;

    if (!spotifyId) {
        res.status(500).json({ error: 'spotifyId not found in cookies' })
        return
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const listener = async (data: TrackData) => {
        const userHistory = await Store.getTrackHistory(spotifyId);
        const isRelevant = userHistory.some(t => t.trackId === data.trackId);
        if (isRelevant) {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        }
    };

    Events.analysis.on(Events.analysisDone, listener);

    req.on('close', () => {
        Events.analysis.off(Events.analysisDone, listener);
        res.end();
    });
});

app.get('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

const startServer = async () => {
    await connectRedis();
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

startServer();

process.on('SIGINT', async () => {
    await redisClient.quit();
    process.exit(0);
});