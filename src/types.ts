export interface SpotifyImage {
    url: string;
    height: number;
    width: number;
}

export interface SpotifyArtist {
    id: string;
    name: string;
}

export interface SpotifyTrack {
    id: string
    name: string;
    artists: SpotifyArtist[];
    album: {
        id: string;
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
    albumId: string;
    artistId: string;
    name: string;
    artist: string;
    album: string;
    releaseDate: string;
    image: string;
    analysis: AnalysisData;
    error?: string;
    loading: boolean;
}

export interface Recommendation {
    name: string;
    creator: string;
    reasoning: string;
}

export interface AnalysisData {
    track?: TrackAnalysis,
    album?: AlbumAnalysis,
    artist?: ArtistAnalysis,
    // video / images / audio
}

export interface TrackAnalysis {
    personnelAndPlaces?: string;
    analysis?: string;
    recommendations?: {
        albums: Recommendation[];
        tracks: Recommendation[];
        books: Recommendation[];
        filmsAndTV: Recommendation[];
    };
    tags?: string[];
}

export interface AlbumAnalysis {
    analysis?: string;
    culturalContext?: string;
}

export interface ArtistAnalysis {
    biography?: string;
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