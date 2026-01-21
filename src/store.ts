import redisClient from "./redis";
import { TrackData } from "./types";

const TRACK_KEY_PREFIX = "track:";
const HISTORY_KEY_PREFIX = "history:";

export const updateCache = async (trackId: string, trackData: TrackData) => {
    await redisClient.set(`${TRACK_KEY_PREFIX}${trackId}`, JSON.stringify(trackData));
};

export const getCacheTrack = async (trackId: string): Promise<TrackData | null> => {
    const data = await redisClient.get(`${TRACK_KEY_PREFIX}${trackId}`);
    return data ? JSON.parse(data) : null;
};

export const pushHistory = async (userId: string, trackId: string) => {
    const key = `${HISTORY_KEY_PREFIX}${userId}`;
    const lastTrackId = await redisClient.lIndex(key, -1);
    
    if (lastTrackId === trackId) return;

    await redisClient.rPush(key, trackId);
};

export const getTrackHistory = async (userId: string, count = 50): Promise<TrackData[]> => {
    const key = `${HISTORY_KEY_PREFIX}${userId}`;
    
    const trackIds = await redisClient.lRange(key, -count, -1);
    
    if (trackIds.length === 0) return [];

    const trackKeys = trackIds.map(id => `${TRACK_KEY_PREFIX}${id}`);
    const cachedTracks = await redisClient.mGet(trackKeys);

    return cachedTracks
        .filter((data): data is string => data !== null)
        .map(data => JSON.parse(data));
};