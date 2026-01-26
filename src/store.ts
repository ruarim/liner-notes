import redisClient from "./redis";
import { TrackDetails } from "./types";

const TRACK_KEY_PREFIX = "track:";
const HISTORY_KEY_PREFIX = "history:";

const getUserHistoryKey = (userId: string) => `${HISTORY_KEY_PREFIX}${userId}`;
const getTrackKey = (trackId: string) => `${TRACK_KEY_PREFIX}${trackId}`;
// 

export const updateTrack = async (trackId: string, trackDetails: TrackDetails) => {
    // handle the different fields 
    await redisClient.set(getTrackKey(trackId), JSON.stringify(trackDetails));
};

export const getTrack = async (trackId: string): Promise<TrackDetails | null> => {
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

// based on trackId get items with at least one tag in common
// then rank by number of tags in common 
export const getRelatedTracks = async (trackId: string, userId: string, count = 5) => {
    const track = await getTrack(trackId);
    if (!track || !track.analysis) return [];
    const history = await getTrackHistory(userId);
    const topTracks = findTracksWithCommonTags(track, history).slice(0, count);
    return topTracks;
};

const findTracksWithCommonTags = (track: TrackDetails, tracks: TrackDetails[]) => {
    const targetTags = track?.analysis?.tags ?? [];
    const commonTracks = tracks.reduce<TrackDetails[]>((prev, curr) => {
        if (curr.trackId === track.trackId) return prev;
        if (curr.analysis?.tags?.length === 0) return prev;
        if (curr.analysis?.tags?.some(tag => targetTags.includes(tag))) {
            return [...prev, curr];
        }
        return prev;
    }, []);

    const countTagsInCommon = (track: TrackDetails) => {
        const tags = track.analysis?.tags ?? [];
        return targetTags.filter(tag => tags.includes(tag)).length;
    };
    return commonTracks.sort((a, b) => {
        return countTagsInCommon(b) - countTagsInCommon(a);
    });
};
