import axios from "axios";
import { SpotifyNowPlayingResponse, SpotifyTrack, TrackDetails } from "./types";

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
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
};

export const getRecentlyPlayed = async (accessToken: string): Promise<{ items: { track: SpotifyTrack }[] }> => {
    const response = await axios.get<{ items: { track: SpotifyTrack }[] }>(
        'https://api.spotify.com/v1/me/player/recently-played',
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
}

export const convertSpotifyTrackToTrackDetails = (track: SpotifyTrack): TrackDetails => {
    return {
        trackId: track.id,
        name: track.name,
        artist: track.artists.map((artist) => artist.name).join(', '),
        album: track.album.name,
        image: track.album.images[0].url,
        releaseDate: track.album.release_date,
        loading: false,
    };
}

export const tokenUrl = 'https://accounts.spotify.com/api/token';

export const authorizeUrl = 'https://accounts.spotify.com/authorize?';

export const scopes = 'user-read-currently-playing user-read-playback-state user-read-recently-played';