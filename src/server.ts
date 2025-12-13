import 'dotenv/config';
import express, { Request, Response } from 'express';
import axios from 'axios';
import querystring from 'querystring';
import { generateText, Output, stepCountIs } from 'ai';
import { z } from 'zod';
import { google, } from '@ai-sdk/google';
import path from 'path';
import { AnalysisData, SpotifyNowPlayingResponse, SpotifyTokenResponse } from './types';

const app = express();

const PORT = process.env.PORT ?? 3000;
const CLIENT_ID = process.env.CLIENT_ID as string;
const CLIENT_SECRET = process.env.CLIENT_SECRET as string;
const REDIRECT_URI = process.env.REDIRECT_URI as string;
const UI_PATH = path.join(process.cwd(), 'dist', 'ui')

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("Missing CLIENT_ID or CLIENT_SECRET in .env file");
    process.exit(1);
}

let TOKEN: string | null = null;

app.use(express.static(UI_PATH));


app.get('/login', (req: Request, res: Response) => {
    const scope = 'user-read-currently-playing user-read-playback-state';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI,
        }));
});

app.get('/callback', async (req: Request, res: Response) => {
    const code = req.query.code as string || null;

    try {
        const response = await axios.post<SpotifyTokenResponse>(
            'https://accounts.spotify.com/api/token',
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

        if (response.data.access_token) {
            TOKEN = response.data.access_token;
            res.redirect('/');
        } else {
            res.send('Failed to retrieve token');
        }
    } catch (error) {
        console.error('Error during authentication', error);
        res.send('Error during authentication');
    }
});


// --- CACHE STATE ---
// We store the analysis here so we don't spam Gemini every 5 seconds
let currentTrackId: string | null = null;
let cachedAnalysisStatus: string = "Waiting for analysis...";
let cachedAnalysisData: AnalysisData | null = null;

// 3. API Route: The frontend polls this
app.get('/api/now-playing', async (req: Request, res: Response) => {
    if (!TOKEN) return res.json({ error: 'Not logged in' });

    try {
        const response = await axios.get<SpotifyNowPlayingResponse>('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        });

        // If nothing is playing, Spotify returns 204 (No Content)
        if (response.status === 204 || response.status > 400) {
            return res.json({ is_playing: false });
        }

        const data = response.data;
        if (!data.item) throw new Error('');
        const trackId = data.item.id;
        const trackName = data.item.name;
        const artistName = data.item.artists.map((a: any) => a.name).join(', ');
        const albumName = data.item.album.name;
        const release_date = data.item.album.release_date;

        // Check if we need to fetch new analysis
        if (trackId !== currentTrackId) {
            console.log(`New track: ${trackName}. Fetching research...`);
            currentTrackId = trackId;
            cachedAnalysisStatus = "Researching this track...";

            // We await here to ensure the user gets data on the first hit
            try {
                const { text } = await generateText({
                    model: google("gemini-3-pro-preview"),
                    experimental_output: Output.object({
                        schema: z.object({
                            albumAnalysis: z.string().describe("Analysis of the album's release, critical reception, and production style."),
                            personnelAndPlaces: z.string().describe("Details on the people (producers, musicians) and places (studios, cities) involved."),
                            artistBiography: z.string().describe("Biography focusing on where the artist was in their career during this specific era."),
                            culturalContext: z.string().describe("The musical scene, genre movements, or cultural climate of the time."),
                            recommendations: z.array(z.string()).describe("Distinct, actionable recommendations (books, albums, or tracks), with reasoning."),
                        })
                    }),
                    tools: {
                        google_search: google.tools.googleSearch({}),
                    },
                    stopWhen: stepCountIs(3),
                    prompt: `
                        You are an expert musicologist and historian. 
                        Analyze the song "${trackName}" by "${artistName}" from the album "${albumName}" (${release_date || 'unknown date'}).

                        Use the Google Search tool to ensure your factual details (dates, personnel, reception) are accurate.

                        Fill out the schema fields concisely (approx 40-50 words per section).
                    `,
                });
                cachedAnalysisData = JSON.parse(text) as AnalysisData;
                cachedAnalysisStatus = 'complete';
            } catch (aiError) {
                console.error("AI Generation failed:", aiError);
                cachedAnalysisStatus = "Could not retrieve research data.";
            }
        }

        res.json({
            is_playing: data.is_playing,
            name: trackName,
            artist: artistName,
            image: data.item.album.images[0]?.url,
            analysis: {
                analysisStatus: cachedAnalysisStatus,
                analysisData: cachedAnalysisData
            }
        });


    } catch (error: any) {
        console.error('Error fetching song:', error.message);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(PORT, () => {
    console.log(`TypeScript Server listening at http://localhost:${PORT}`);
});