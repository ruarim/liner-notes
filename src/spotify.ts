import axios from "axios";
import { SpotifyNowPlayingResponse } from "./types";

export const getCurrentlyPlaying = async (accessToken: string) => {
    const response = await axios.get<SpotifyNowPlayingResponse>(
        'https://api.spotify.com/v1/me/player/currently-playing',
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const track = response.data.item;
    return track
}

export const tokenUrl = 'https://accounts.spotify.com/api/token';

export const authorizeUrl = 'https://accounts.spotify.com/authorize?';

export const scopes = 'user-read-currently-playing user-read-playback-state';