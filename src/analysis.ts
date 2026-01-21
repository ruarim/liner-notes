import { google } from "@ai-sdk/google";
import { generateText, Output, stepCountIs } from "ai";
import { z } from 'zod';
import { AnalysisData, TrackData } from "./types";
import * as Store from "./store";
import * as Events from "./events";

const MODEL_NAME = process.env.MODEL_NAME || "gemini-3-flash-preview";

export async function generateContent(track: TrackData) {
    console.log(`Starting research for ${track.name} - ${track.album} - ${track.artist}`)
    
    try {
        const prompt =
            "You are an expert musicologist and cultural historian. \n" +
            `Analyze the song "${track.name}" by "${track.artist}" from the album "${track.album}" (${track.releaseDate || 'unknown date'}).\n` +
            "Use the Google Search tool to ensure your factual details (dates, personnel, reception, recommendations, etc) are accurate. \n" +
            "Fill out the schema fields concisely in full sentences. \n" +
            "Focus on novel information which would be interesting to someone who already knows a lot about music. \n" +
            "Ensure a none conversational style, the output will be shown directly to the user.";

        const { output } = await generateText({
            model: google(MODEL_NAME),
            output: schema,
            tools: {
                google_search: google.tools.googleSearch({}),
            },
            stopWhen: stepCountIs(3),
            prompt,
        });
        const analysis: AnalysisData = output;
        const updatedTrack: TrackData = {
            ...track,
            loading: false,
            analysis: { ...analysis }
        }
        Store.updateCache(track.trackId, updatedTrack)
        Events.analysis.emit(Events.analysisUpdate, updatedTrack);
        console.log(`Finished research for ${track.name} - ${track.album} - ${track.artist}`)
    } catch (error) {
        console.error(`Analysis error for ${track.trackId}:`, error);
        const updatedTrack: TrackData = {
            ...track,
            loading: false,
            error: 'Error retrieving research'
        }
        Store.updateCache(track.trackId, updatedTrack)
        Events.analysis.emit(Events.analysisUpdate, updatedTrack);
    }
}

const schema = Output.object({
    schema: z.object({
        albumAnalysis: z.string().describe("Analysis of the album's release, critical reception, and production style."),
        personnelAndPlaces: z.string().describe("Details on the people (producers, musicians) and places (studios, cities) involved."),
        artistBiography: z.string().describe("Biography focusing on where the artist was in their career during this specific era."),
        culturalContext: z.string().describe("The musical scene, genre movements, or cultural climate of the time."),
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
        // relatedArtists: z.array(z.object({
        //     name: z.string(),
        //     artist: z.string(),
        //     reasoning: z.string(),
        // })).describe("Distinct, actionable related artists recommendations, with reasoning."),
        // relatedTracks: z.array(z.object({
        //     name: z.string(),
        //     artist: z.string(),
        //     reasoning: z.string(),
        // })).describe("Distinct, actionable related tracks recommendations, with reasoning."),
        // relatedAlbums: z.array(z.object({
        //     name: z.string(),
        //     artist: z.string(),
        //     reasoning: z.string(),
        // })).describe("Distinct, actionable related albums recommendations, with reasoning."),
    })
})