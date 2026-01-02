import { TrackData } from "./types";

// add timestamps

// trackId => trackData
export const trackCache = new Map<string, TrackData>();
// sessionId => Array of trackIds
export const userTrackHistory = new Map<string, Array<string>>();

const MAX_HISTORY_SIZE = 50;

export const updateCache = (trackId: string, trackData: TrackData) => {
    trackCache.set(trackId, trackData)
}
export const getCacheTrack = (trackId: string) => trackCache.get(trackId);
export const pushHistory = (userId: string, trackId: string) => {
    const history = userTrackHistory.get(userId)
    if (!history) {
        userTrackHistory.set(userId, [trackId]);
        return;
    }
    const lastTrackId = history[history.length - 1];
    if (lastTrackId === trackId) return;

    history.push(trackId);
    
    if (history.length > MAX_HISTORY_SIZE) {
        history.shift();
    }
}

export const getTrackHistory = (userId: string) => {
    const trackIds = userTrackHistory.get(userId) ?? [];
    return trackIds
        .flatMap(id => {
            const track = trackCache.get(id);;
            return track ? [track] : [];
        })
};