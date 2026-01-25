export interface SpotifyImage {
    url: string;
    height: number;
    width: number;
}

export interface SpotifyArtist {
    name: string;
}

export interface SpotifyTrack {
    id: string
    name: string;
    artists: SpotifyArtist[];
    album: {
        name: string;
        images: SpotifyImage[];
        release_date: string;
    };
    duration_ms: number;
}

export interface SpotifyNowPlayingResponse {
    is_playing: boolean;
    item: SpotifyTrack | null;
    progress_ms: number;
}

export interface SpotifyTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
}

export interface TrackDetails {
    trackId: string;
    name: string;
    artist: string;
    album: string;
    releaseDate: string;
    image: string;
    analysis?: AnalysisData;
    error?: string;
    loading: boolean;
}

export interface Recommendation {
    name: string;
    creator: string;
    reasoning: string;
}

export interface AnalysisData {
    albumAnalysis: string;
    trackAnalysis: string;
    personnelAndPlaces: string;
    artistBiography: string;
    culturalContext: string;
    recommendations: {
        albums: Recommendation[];
        tracks: Recommendation[];
        books: Recommendation[];
        filmsAndTV: Recommendation[];
    };
    tags: string[];
}

export interface SessionData {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    spotifyId: string;
} 

export interface SpotifyUser {
    id: string;
}