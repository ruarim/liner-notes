import 'dotenv/config';
import express, { Request, Response } from 'express';
import axios from 'axios';

import { SpotifyTokenResponse, TrackDetails } from './types';
import * as Store from './store';
import * as Spotify from './spotify';
import * as Analysis from './analysis';
import * as Events from "./events";
import redisClient, { connectRedis } from './redis';
import jwt from 'jsonwebtoken';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, cookieName, JWT_SECRET, PORT, REDIRECT_URI, UI_PATH, defaultAnalysis } from './consts';
import cookieParser from 'cookie-parser';
import { AuthenticatedRequest, authenticateJWT } from './middleware';


const app = express();

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !JWT_SECRET) {
    console.error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env file");
    process.exit(1);
}

app.set('trust proxy', 1); // trust the first hop (the load balancer)
app.use(cookieParser());
app.use(express.static(UI_PATH));

app.get('/auth', (_: Request, res: Response) => {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope: Spotify.scopes,
        redirect_uri: REDIRECT_URI,
    });
    res.redirect(`${Spotify.authorizeUrl}${params.toString()}`);
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
                    Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                },
            }
        );

        const tokenData = {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            expiresAt: Date.now() + response.data.expires_in * 1000,
        };
        const userProfile = await Spotify.getUser(tokenData);
        const sessionData = {
            ...tokenData,
            spotifyId: userProfile.id
        };

        const token = jwt.sign(sessionData, JWT_SECRET, { expiresIn: '7d' });

        res.cookie(cookieName, token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.redirect('/');
    } catch (error) {
        console.error('Error during authentication', error);
        res.status(500).send('Authentication Error');
    }
});

app.get('/logout', (_: Request, res: Response) => {
    res.clearCookie(cookieName);
    res.redirect('/');
});

// rename to analysis-history
app.get('/api/history', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    const spotifyId = req.user?.spotifyId;
    if (!spotifyId) return res.status(401).json({ error: 'Unauthorized' });
    const history = await Store.getTrackHistory(spotifyId);
    res.json({ history });
});

app.get('/api/now-playing', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    // we should really validate that the user object actully contains the field we need
    const user = req.user;
    if (!user) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    try {
        const track = await Spotify.getCurrentlyPlaying(user)
        if (!track) return res.status(200).json(null)
        let trackDetails: TrackDetails = {
            ...Spotify.convertSpotifyTrackToTrackDetails(track)
        }
        res.status(200).json(trackDetails);
    } catch (error: any) {
        console.error('Error during now playing', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.get('/api/recently-played', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: 'Not logged in' });
        const spotifyRecentlyPlayed = (await Spotify.getRecentlyPlayed(user)).items;
        const recentlyPlayed: Array<TrackDetails> = spotifyRecentlyPlayed.map(({ track }) => {
            return {
                ...Spotify.convertSpotifyTrackToTrackDetails(track),
                loading: false,
            }
        })
        res.json(recentlyPlayed);
    } catch (error: any) {
        console.error('Error during recently played', error?.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.post('/api/analyse', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: 'Not logged in' });
        const trackId = req.query.trackId as string;
        let track = await Store.getTrack(trackId);
        if (!track) {
            const spotifyTrack = await Spotify.getTrack(trackId, user);
            track = Spotify.convertSpotifyTrackToTrackDetails(spotifyTrack);
            await Store.pushHistory(user.spotifyId, track.trackId);
        }
        if (Analysis.trackAnalysisFilled(track)) {
            res.status(200).json({ message: 'Analysis already completed' });
            return;
        }
        const updatedTrack = {
            ...track,
            loading: true,
            error: undefined,
            analysis: { ...defaultAnalysis, ...track.analysis },
        };
        await Store.updateTrack(track.trackId, updatedTrack);
        Events.analysis.emit(Events.analysisUpdate, updatedTrack);
        Analysis.runAnalysis(updatedTrack);
        res.status(200).json({ message: 'Analysis triggered' });
    } catch (error: any) {
        console.error('Error during analyse', error?.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/events', authenticateJWT, (req: AuthenticatedRequest, res) => {
    const spotifyId = req.user?.spotifyId;
    if (!spotifyId) {
        res.status(500).json({ error: 'spotifyId not found in cookies' })
        return
    }
    Events.setupAnalysisSSE(req, res, spotifyId);
});

app.get('/api/related-tracks', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        const limit = req.query.limit as string ?? 5;
        if (!user) return res.status(401).json({ error: 'Not logged in' });
        const trackId = req.query.trackId as string;
        const relatedTracks = await Store.getRelatedTracks(
            trackId,
            user.spotifyId,
            parseInt(limit)
        );
        res.json(relatedTracks);
    } catch (error: any) {
        console.error('Error during related tracks', error?.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

const startServer = async () => {
    await connectRedis();
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

startServer();

process.on('SIGINT', async () => {
    await redisClient.quit();
    process.exit(0);
});