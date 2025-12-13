interface SpotifyImage {
    url: string;
    height: number;
    width: number;
}

interface SpotifyArtist {
    name: string;
}

interface SpotifyTrack {
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

interface SpotifyNowPlayingResponse {
    is_playing: boolean;
    item: SpotifyTrack | null; // Item is null if playing a podcast or local file sometimes
    progress_ms: number;
}

interface SpotifyTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
}