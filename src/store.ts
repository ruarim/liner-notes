import { getDb } from "./mongodb";
import { TrackDetails } from "./types";

interface HistoryDocument {
    userId: string;
    trackIds: string[];
}

const getTracks = () => getDb().collection<TrackDetails>("tracks");
const getHistories = () => getDb().collection<HistoryDocument>("histories");

export const updateTrack = async (trackId: string, trackDetails: TrackDetails) => {
    const track = JSON.parse(JSON.stringify(trackDetails)) as TrackDetails;
    await getTracks().replaceOne({ trackId }, track, { upsert: true });
};

export const getTrack = async (trackId: string): Promise<TrackDetails | null> => {
    return getTracks().findOne({ trackId }, { projection: { _id: 0 } });
};

export const pushHistory = async (userId: string, trackId: string) => {
    const history = await getHistories().findOne(
        { userId },
        { projection: { _id: 0, trackIds: { $slice: -1 } } }
    );
    if (history?.trackIds[0] === trackId) return;
    await getHistories().updateOne(
        { userId },
        { $push: { trackIds: trackId } },
        { upsert: true }
    );
};

export const getTrackHistory = async (userId: string, count = 50): Promise<TrackDetails[]> => {
    const history = await getHistories().findOne(
        { userId },
        { projection: { _id: 0, trackIds: { $slice: -count } } }
    );

    if (!history || history.trackIds.length === 0) return [];

    const tracks = await getTracks()
        .find({ trackId: { $in: history.trackIds } }, { projection: { _id: 0 } })
        .toArray();
    const tracksById = new Map<string, TrackDetails>(
        tracks.map(track => [track.trackId, track])
    );

    return history.trackIds
        .map(trackId => tracksById.get(trackId))
        .filter((track): track is TrackDetails => track !== undefined);
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
        if (prev.some(t => t.trackId === curr.trackId)) return prev;
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
