import redisClient from "./redis";
import { TrackDetails } from "./types";

const TRACK_KEY_PREFIX = "track:";
const HISTORY_KEY_PREFIX = "history:";

const getUserHistoryKey = (userId: string) => `${HISTORY_KEY_PREFIX}${userId}`;
const getTrackKey = (trackId: string) => `${TRACK_KEY_PREFIX}${trackId}`;

export const updateCache = async (trackId: string, trackDetails: TrackDetails) => {
    await redisClient.set(getTrackKey(trackId), JSON.stringify(trackDetails));
};

export const getCacheTrack = async (trackId: string): Promise<TrackDetails | null> => {
    const data = await redisClient.get(getTrackKey(trackId));
    return data ? JSON.parse(data) : null;
};

export const pushHistory = async (userId: string, trackId: string) => {
    const key = getUserHistoryKey(userId);
    const lastTrackId = await redisClient.lIndex(key, -1);
    if (lastTrackId === trackId) return;
    await redisClient.rPush(key, trackId);
};

export const hasTrackInHistory = async (userId: string, trackId: string): Promise<boolean> => {
    const key = getUserHistoryKey(userId);
    const trackIds = await redisClient.lRange(key, 0, -1);
    return trackIds.includes(trackId);
};

export const getTrackHistory = async (userId: string, count = 50): Promise<TrackDetails[]> => {
    const key = getUserHistoryKey(userId);

    const trackIds = await redisClient.lRange(key, -count, -1);

    if (trackIds.length === 0) return [];

    const trackKeys = trackIds.map(id => getTrackKey(id));
    const cachedTracks = await redisClient.mGet(trackKeys);

    return cachedTracks
        .filter((data): data is string => data !== null)
        .map(data => JSON.parse(data));
};