import jwt from 'jsonwebtoken';
import axios from 'axios';
import { Request, Response } from 'express';

import { SPOTIFY_CLIENT_ID, REDIRECT_URI, SPOTIFY_CLIENT_SECRET, JWT_SECRET, COOKIE_NAME, DEFAULT_ANALYSIS } from './consts';
import { SpotifyTokenResponse, TrackDetails } from './types';
import { AuthenticatedRequest } from './middleware';

import * as Spotify from './spotify';
import * as Store from './store';
import * as Analysis from './analysis';
import * as Events from "./events";

export const auth = (_: Request, res: Response) => {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope: Spotify.scopes,
        redirect_uri: REDIRECT_URI,
    });
    res.redirect(`${Spotify.authorizeUrl}${params.toString()}`);
}

export const callback = async (req: Request, res: Response) => {
    const code = req.query.code as string || null;

    try {
        const {
            access_token,
            refresh_token,
            expires_in
        } = await Spotify.swapAuthCodeForToken(code as string);

        const tokenData = {
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt: Date.now() + expires_in * 1000,
        };
        const userProfile = await Spotify.getUser(tokenData);
        const sessionData = {
            ...tokenData,
            spotifyId: userProfile.id
        };

        const token = jwt.sign(sessionData, JWT_SECRET, { expiresIn: '7d' });

        res.cookie(COOKIE_NAME, token, {
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
}

export const logout = (_: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.redirect('/');
}

export const history = async (req: AuthenticatedRequest, res: Response) => {
    const spotifyId = req.user?.spotifyId;
    if (!spotifyId) return res.status(401).json({ error: 'Unauthorized' });
    const history = await Store.getTrackHistory(spotifyId);
    res.json({ history });
}

export const nowPlaying = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Not logged in' });
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
}

export const recentlyPlayed = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Not logged in' });
    try {
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
}

export const analyse = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Not logged in' });
    try {
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
            analysis: { ...DEFAULT_ANALYSIS, ...track.analysis },
        };
        await Store.updateTrack(track.trackId, updatedTrack);
        Events.analysis.emit(Events.analysisUpdate, updatedTrack);
        Analysis.runAnalysis(updatedTrack);
        res.status(200).json({ message: 'Analysis triggered' });
    } catch (error: any) {
        console.error('Error during analyse', error?.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const sse = (req: AuthenticatedRequest, res: Response) => {
    const spotifyId = req.user?.spotifyId;
    if (!spotifyId) {
        res.status(500).json({ error: 'spotifyId not found in cookies' })
        return
    }
    Events.setupAnalysisSSE(req, res, spotifyId);
}

export const relatedTracks = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    const limit = req.query.limit as string ?? 5;
    const trackId = req.query.trackId as string;
    if (!user) return res.status(401).json({ error: 'Not logged in' });
    try {
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
}


