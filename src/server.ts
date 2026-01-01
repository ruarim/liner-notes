import 'dotenv/config';
import express, { Request, Response } from 'express';
import session from 'express-session';
import axios from 'axios';
import querystring from 'querystring';
import path from 'path';
import { SpotifyTokenResponse, TrackData } from './types';
import { getTrackAnalysis } from './analysis';
import { analysisCache, getHistory, updateHistory } from './store';
import * as Spotify from './spotify';

declare module 'express-session' {
    interface SessionData {
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
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
    saveUninitialized: true,
    cookie: { secure: false } // Set true if using HTTPS and add SESSION_SECRET to .env
}));


app.get('/login', (_: Request, res: Response) => {
    res.redirect(Spotify.authorizeUrl +
        querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: Spotify.scopes,
            redirect_uri: REDIRECT_URI,
        }));
});

app.get('/callback', async (req: Request, res: Response) => {
    const code = req.query.code as string || null;

    try {
        const response = await axios.post<SpotifyTokenResponse>(
            Spotify.tokenUrl,
            querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
                },
            }
        );

        req.session.accessToken = response.data.access_token;
        req.session.refreshToken = response.data.refresh_token;
        req.session.expiresAt = Date.now() + response.data.expires_in * 1000;

        res.redirect('/');
    } catch (error) {
        console.error('Error during authentication', error);
        res.status(500).send('Authentication Error');
    }
});

app.get('/api/history', async (req: Request, res: Response) => {
    const { id } = req.session;

    const history = getHistory(id)

    res.json({ history })
})

app.get('/api/now-playing', async (req: Request, res: Response) => {
    const { accessToken, id } = req.session;

    if (!accessToken) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    try {
        const track = await Spotify.getCurrentlyPlaying(accessToken)
        if (!track) {
            return res.json({ is_playing: false });
        }
        const artistNames = track.artists.map((a: any) => a.name).join(', ');

        updateHistory(id, track.id)

        const cached = analysisCache.get(track.id);
        if (!cached) {
            // run the analysis in the background
            getTrackAnalysis(
                track.name,
                artistNames,
                track.album.name,
                track.album.release_date,
                track.id
            );
        }

        res.json({
            is_playing: true,
            name:       track.name,
            artist:     artistNames,
            image:      track.album.images[0]?.url,
            trackId:    track.id,
            analysis:   cached?.data   || undefined,
            status:     cached?.status || "Initializing research..."
        } satisfies TrackData);

    } catch (error: any) {
        // If 401, the token likely expired
        if (error.response?.status === 401) {
            return res.status(401).json({ error: 'Token expired' });
        }
        res.status(500).json({ error: 'Failed to fetch' });
    }
});

app.get('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});