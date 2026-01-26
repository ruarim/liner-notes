import { google } from "@ai-sdk/google";
import { generateText, Output, stepCountIs } from "ai";
import { z } from 'zod';
import { AnalysisData, TrackDetails } from "./types";
import * as Store from "./store";
import * as Events from "./events";
import { defaultAnalysis } from "./consts";

const MODEL_NAME = process.env.MODEL_NAME || "gemini-3-flash-preview";

const maxWord = 'Max 100 Words';
const ANALYSIS_SHAPE = {
    trackAnalysis: z.string().describe(`Analysis of the track's release, critical reception, and production style. ${maxWord}`),
    albumAnalysis: z.string().describe(`Analysis of the album's release, critical reception, and production style. ${maxWord}`),
    personnelAndPlaces: z.string().describe(`Details on the people (producers, musicians) and places (studios, cities) involved. ${maxWord}`),
    artistBiography: z.string().describe(`Biography focusing on where the artist was in their career during this specific era. ${maxWord}`),
    culturalContext: z.string().describe(`The musical scene, genre movements, or cultural climate of the time. ${maxWord}`),
    recommendations: z.object({
        albums: z.array(z.object({
            name: z.string(),
            creator: z.string(),
            reasoning: z.string(),
        })).describe("Distinct, actionable album recommendations, with reasoning."),
        tracks: z.array(z.object({
            name: z.string(),
            creator: z.string(),
            reasoning: z.string(),
        })).describe("Distinct, actionable track recommendations, with reasoning."),
        books: z.array(z.object({
            name: z.string(),
            creator: z.string(),
            reasoning: z.string(),
        })).describe("Distinct, actionable book recommendations, with reasoning."),
        filmsAndTV: z.array(z.object({
            name: z.string(),
            creator: z.string(),
            reasoning: z.string(),
        })).describe("Distinct, actionable film and TV recommendations, with reasoning."),
    }),
    tags: z.array(z.string()).describe("Tags describing the song, album, artist, and cultural context."),
};

export async function generateContent(track: TrackDetails) {
    console.log(`Starting research for ${track.name} - ${track.album} - ${track.artist}`)

    try {
        const analysis: AnalysisData = await handleGenerateResearch(track);
        const updatedTrack: TrackDetails = {
            ...track,
            loading: false,
            analysis: { ...analysis }
        }
        Store.updateTrack(track.trackId, updatedTrack)
        Events.analysis.emit(Events.analysisUpdate, updatedTrack);
        console.log(`Finished research for ${track.name} - ${track.album} - ${track.artist}`)
    } catch (error) {
        console.error(`Analysis error for ${track.trackId}:`, error);
        const updatedTrack: TrackDetails = {
            ...track,
            loading: false,
            error: 'Error retrieving research'
        }
        Store.updateTrack(track.trackId, updatedTrack)
        Events.analysis.emit(Events.analysisUpdate, updatedTrack);
    }
}

// this function will generate text for fields that are not filled
const handleGenerateResearch = async (track: TrackDetails) => {
    const analysis: AnalysisData = track.analysis || {};
    const prompt =
        "You are an expert musicologist and cultural historian. \n" +
        `Analyze the song "${track.name}" by "${track.artist}" from the album "${track.album}" (${track.releaseDate || 'unknown date'}).\n` +
        "Use the Google Search tool to ensure your factual details (dates, personnel, reception, recommendations, etc) are accurate. \n" +
        "Fill out the schema fields concisely in full sentences. \n" +
        "Focus on novel information which would be interesting to someone who already knows a lot about music. \n" +
        "Ensure a none conversational style, the output will be shown directly to the user.";

    // conditionally create the schema for the model to fill in.
    const keysToFill = Object
        .keys(ANALYSIS_SHAPE)
        .filter((key) => !valueIsFilled(analysis?.[key as keyof AnalysisData]));

    if (keysToFill.length === 0) {
        return {};
    }

    const partialSchema = Output.object({
        schema: z.object(
            Object.fromEntries(
                keysToFill.map((key) => [key, ANALYSIS_SHAPE[key as keyof typeof ANALYSIS_SHAPE]])
            )
        )
    });

    const { output } = await generateText({
        model: google(MODEL_NAME),
        output: partialSchema,
        tools: {
            google_search: google.tools.googleSearch({}),
        },
        stopWhen: stepCountIs(3),
        prompt,
    });
    
    return { ...analysis, ...output };
} 

export const trackAnalysisFilled = (track: TrackDetails) => {
    return Object
        .entries(defaultAnalysis)
        .every(([key]) => valueIsFilled(track.analysis?.[key as keyof typeof defaultAnalysis]));
};

export const valueIsFilled = (value: any) => {
    if (Array.isArray(value)) {
        return value.length > 0;
    }

    if (typeof value === 'object' && value !== null) {
        return true;
    }

    return value !== undefined && value !== null && value !== '';
};
