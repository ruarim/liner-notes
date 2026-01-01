import { AnalysisData } from "./types";

// add timestamps

// trackId => trackData
export const analysisCache = new Map<string, { status: string; data: AnalysisData | null }>();
// sessionId => Array of trackIds
export const userTrackHistory = new Map<string, Array<string>>();

const MAX_HISTORY_SIZE = 50;

export const updateHistory = (userId: string, trackId: string) => {
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

export const getHistory = (userId: string) => {
    const ids = userTrackHistory.get(userId) ?? [];
    return ids
        .flatMap(id => {
            const track = analysisCache.get(id);
            return track ? [track] : [];
        });
};