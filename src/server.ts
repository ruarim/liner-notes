import 'dotenv/config';
import express, { Request, Response } from 'express';
import axios from 'axios';
import querystring from 'querystring';
import { generateText } from 'ai';
import { google, GoogleGenerativeAIProviderOptions } from '@ai-sdk/google';
import path from 'path';

const app = express();

const PORT = process.env.PORT ?? 3000;
const CLIENT_ID = process.env.CLIENT_ID as string;
const CLIENT_SECRET = process.env.CLIENT_SECRET as string;
const REDIRECT_URI = process.env.REDIRECT_URI as string;
const UI_PATH =  path.join(process.cwd(), 'dist', 'ui')

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

const getResearch = async () => {
    const { text } = await generateText({
        model: google("gemini-3-pro-preview"),
        prompt: "What is love?",

    });
    return text
}

// --- CACHE STATE ---
// We store the analysis here so we don't spam Gemini every 5 seconds
let currentTrackId: string | null = null;
let cachedAnalysis: string = "Waiting for analysis...";

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
            cachedAnalysis = "Researching this track...";

            // We await here to ensure the user gets data on the first hit
            try {
                const { text } = await generateText({
                    model: google("gemini-2.5-flash"),
                    tools: {
                        google_search: google.tools.googleSearch({}),
                    },
                    prompt: `
                        You are an expert musicologist and historian. 
                        Analyze the song "${trackName}" by "${artistName}" from the album "${albumName}"(${release_date}).
                        
                        Provide a structured research summary in exactly these three sections. 
                        Do not use markdown bolding (**) for the body text, only for the headers.

                        **The Album**
                        Discuss the album's release, critical reception, production style, or significance in the artist's discography.

                        **The Personnel/Places**
                        Explain the people and places involved in this musical artist.

                        **The Artist**
                        Provide a brief biography focusing on where the artist was in their career when this track was released.

                        **The Context**
                        Explain the specific musical scene, genre movements, or the cultural climate the artist was working in at the time.
                        
                        **Where to Look Next**
                        Provide 3 specific recommendations for further research. These should be distinct and actionable, such as:
                        - A seminal book or documentary about this artist or scene.
                        - An essential album by a *different* artist that influenced or was influenced by this sound.
                        - A deep-cut track that provides more context.

                        Keep each section concise.
                    `,
                    // providerOptions: {
                    //     google: {
                    //         thinkingConfig: {
                    //             thinkingLevel: 'high'
                    //         }
                    //     } satisfies GoogleGenerativeAIProviderOptions
                    // }
                });
                cachedAnalysis = text;
            } catch (aiError) {
                console.error("AI Generation failed:", aiError);
                cachedAnalysis = "Could not retrieve research data.";
            }
        }

        res.json({
            is_playing: data.is_playing,
            name: trackName,
            artist: artistName,
            image: data.item.album.images[0]?.url,
            analysis: cachedAnalysis
        });


    } catch (error: any) {
        console.error('Error fetching song:', error.message);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(PORT, () => {
    console.log(`TypeScript Server listening at http://localhost:${PORT}`);
});