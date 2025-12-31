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
    item: SpotifyTrack | null; // Item is null if playing a podcast or local file sometimes
    progress_ms: number;
}

export interface SpotifyTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
}

export interface TrackData {
  trackId: string;
  is_playing: boolean;
  name?: string;
  artist?: string;
  image?: string;
  analysis?: AnalysisData;
  error?: string;
  status: string;
}

export interface AnalysisData {
  albumAnalysis: string;
  personnelAndPlaces: string;
  artistBiography: string;
  culturalContext: string;
  recommendations: string[];
}