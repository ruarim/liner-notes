import redisClient from "./redis";
import { TrackDetails, AlbumAnalysis, TrackAnalysis, ArtistAnalysis } from "./types";

const TRACK_KEY_PREFIX = "track:";
const HISTORY_KEY_PREFIX = "history:";
const ANALYSIS_KEY_PREFIX = "analysis:";

const getUserHistoryKey = (userId: string) => `${HISTORY_KEY_PREFIX}${userId}`;
const getTrackKey = (trackId: string) => `${TRACK_KEY_PREFIX}${trackId}`;
const getArtistAnalysisKey = (artistId: string) => `${ANALYSIS_KEY_PREFIX}${artistId}`;
const getAlbumAnalysisKey = (albumId: string) => `${ANALYSIS_KEY_PREFIX}${albumId}`;
const getTrackAnalysisKey = (trackId: string) => `${ANALYSIS_KEY_PREFIX}${trackId}`;

export const updateJSON = async <T>(key: string, data: T) => {
    await redisClient.set(key, JSON.stringify(data));
};

export const getJSON = async <T>(key: string): Promise<T | undefined> => {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : undefined;
};

export const updateTrack = async (trackId: string, trackDetails: TrackDetails) => {
    await updateJSON(getTrackKey(trackId), trackDetails);
    
    const analysis = trackDetails.analysis;
    if (analysis?.track) {
        await updateJSON(getTrackAnalysisKey(trackId), analysis.track);
    }
    if (analysis?.album) {
        await updateJSON(getAlbumAnalysisKey(trackDetails.albumId), analysis.album);
    }
    if (analysis?.artist) {
        await updateJSON(getArtistAnalysisKey(trackDetails.artistId), analysis.artist);
    }
};

export const getTrack = async (trackId: string): Promise<TrackDetails | undefined> => {
    const track = await getJSON<TrackDetails>(getTrackKey(trackId));
    if(!track) return undefined;
    const analysis = {
        album: await getJSON<AlbumAnalysis>(getAlbumAnalysisKey(track.albumId)),
        track: await getJSON<TrackAnalysis>(getTrackAnalysisKey(track.trackId)),
        artist: await getJSON<ArtistAnalysis>(getArtistAnalysisKey(track.artistId)),
    }
    return {
        ...track,
        analysis
    };
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
    const targetTags = track?.analysis?.track?.tags ?? [];
    const commonTracks = tracks.reduce<TrackDetails[]>((prev, curr) => {
        const currTags = curr?.analysis?.track?.tags ?? [];
        if (curr.trackId === track.trackId) return prev;
        if (prev.some(t => t.trackId === curr.trackId)) return prev;
        if (currTags.length === 0) return prev;
        if (currTags.some(tag => targetTags.includes(tag))) {
            return [...prev, curr];
        }
        return prev;
    }, []);

    const countTagsInCommon = (track: TrackDetails) => {
        const tags = track.analysis?.track?.tags ?? [];
        return targetTags.filter(tag => tags.includes(tag)).length;
    };
    return commonTracks.sort((a, b) => {
        return countTagsInCommon(b) - countTagsInCommon(a);
    });
};
