import axios from "axios";
import { SpotifyNowPlayingResponse, SpotifyTrack } from "./types";

export const getCurrentlyPlaying = async (accessToken: string): Promise<SpotifyTrack | null> => {
    const response = await axios.get<SpotifyNowPlayingResponse>(
        'https://api.spotify.com/v1/me/player/currently-playing',
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const track = response.data.item;
    return track
}

export const getTrack = async (trackId: string, accessToken: string): Promise<SpotifyTrack> => {
    const response = await axios.get<SpotifyTrack>(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
    return response.data;
};

export const tokenUrl = 'https://accounts.spotify.com/api/token';

export const authorizeUrl = 'https://accounts.spotify.com/authorize?';

export const scopes = 'user-read-currently-playing user-read-playback-state';