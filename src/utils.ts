import { defaultAnalysis } from "./consts";
import { TrackDetails } from "./types";

export const trackAnalysisFilled = (track: TrackDetails) => {
    return Object
        .entries(defaultAnalysis)
        .every(([key, _]) =>
            track.analysis?.[key as keyof typeof defaultAnalysis] !== undefined &&
            track.analysis?.[key as keyof typeof defaultAnalysis] !== null &&
            track.analysis?.[key as keyof typeof defaultAnalysis] !== ''
        );
};