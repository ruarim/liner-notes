import axios from "axios";
import { SpotifyNowPlayingResponse, SpotifyTrack, TrackDetails, SessionData, SpotifyTokenResponse, SpotifyUser } from "./types";
import { defaultAnalysis, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "./consts";

export const getRefreshedAccessToken = async (refreshToken: string): Promise<SpotifyTokenResponse> => {
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    });

    const response = await axios.post<SpotifyTokenResponse>(
        'https://accounts.spotify.com/api/token',
        params,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
            },
        }
    );

    return response.data;
};

const authenticatedRequest = async <T>(
    session: Omit<SessionData, 'spotifyId'>,
    request: (accessToken: string) => Promise<T>
): Promise<T> => {
    try {
        return await request(session.accessToken);
    } catch (error: any) {
        if (error.response?.status === 401) {
            try {
                const newTokens = await getRefreshedAccessToken(session.refreshToken);
                session.accessToken = newTokens.access_token;
                if (newTokens.refresh_token) {
                    session.refreshToken = newTokens.refresh_token;
                }
                // ideally we should update the session in the store/cookie here as well preventing future 401s
                // but for now we just retry the request
                return await request(session.accessToken);
            } catch (refreshError) {
                console.error("Failed to refresh token", refreshError);
                throw error; // Throw the original 401 or the refresh error? Probably original makes more sense to upstream
            }
        }
        throw error;
    }
};

export const getCurrentlyPlaying = async (session: Omit<SessionData, 'spotifyId'>): Promise<SpotifyTrack | null> => {
    return authenticatedRequest(session, async (accessToken) => {
        const response = await axios.get<SpotifyNowPlayingResponse>(
            'https://api.spotify.com/v1/me/player/currently-playing',
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response.data.item;
    });
}

export const getTrack = async (trackId: string, session: Omit<SessionData, 'spotifyId'>): Promise<SpotifyTrack> => {
    return authenticatedRequest(session, async (accessToken) => {
        const response = await axios.get<SpotifyTrack>(
            `https://api.spotify.com/v1/tracks/${trackId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response.data;
    });
};

export const getRecentlyPlayed = async (session: Omit<SessionData, 'spotifyId'>): Promise<{ items: { track: SpotifyTrack }[] }> => {
    return authenticatedRequest(session, async (accessToken) => {
        const response = await axios.get<{ items: { track: SpotifyTrack }[] }>(
            'https://api.spotify.com/v1/me/player/recently-played',
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response.data;
    });
}

export const convertSpotifyTrackToTrackDetails = (track: SpotifyTrack): TrackDetails => {
    return {
        trackId: track.id,
        albumId: track.album.id,
        artistId: track.artists[0].id,
        name: track.name,
        artist: track.artists.map((artist) => artist.name).join(', '),
        album: track.album.name,
        image: track.album.images[0].url,
        releaseDate: track.album.release_date,
        loading: false,
        analysis: defaultAnalysis,
    };
}

export const getUser = async (session: Omit<SessionData, 'spotifyId'>): Promise<SpotifyUser> => {
    return authenticatedRequest(session, async (accessToken) => {
        const response = await axios.get<SpotifyUser>(
            'https://api.spotify.com/v1/me',
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response.data;
    });
}

export const tokenUrl = 'https://accounts.spotify.com/api/token';

export const authorizeUrl = 'https://accounts.spotify.com/authorize?';

export const scopes = 'user-read-currently-playing user-read-playback-state user-read-recently-played';