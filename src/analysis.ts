import { google } from "@ai-sdk/google";
import { generateText, Output, stepCountIs } from "ai";
import { z } from 'zod';
import { AnalysisData, TrackData } from "./types";
import * as Store from "./store";
import * as Events from "./events";

const DEFAULT_MODEL = "gemini-3-pro-preview";

export async function generateContent(track: TrackData) {
    console.log(`Starting research for ${track.name} - ${track.album} - ${track.artist}`)
    const modelName = process.env.MODEL_NAME || DEFAULT_MODEL;
    try {
        const { text } = await generateText({
            model: google(modelName),
            output: Output.object({
                schema: z.object({
                    albumAnalysis: z.string().describe("Analysis of the album's release, critical reception, and production style."),
                    personnelAndPlaces: z.string().describe("Details on the people (producers, musicians) and places (studios, cities) involved."),
                    artistBiography: z.string().describe("Biography focusing on where the artist was in their career during this specific era."),
                    culturalContext: z.string().describe("The musical scene, genre movements, or cultural climate of the time."),
                    recommendations: z.array(z.string()).describe("Distinct, actionable recommendations (books, albums, tracks etc), with reasoning."),
                })
            }),
            tools: {
                google_search: google.tools.googleSearch({}),
            },
            stopWhen: stepCountIs(3),
            prompt: `
                        You are an expert musicologist and cultural historian. 
                        Analyze the song "${track.name}" by "${track.artist}" from the album "${track.album}" (${track.releaseDate || 'unknown date'}).

                        Use the Google Search tool to ensure your factual details (dates, personnel, reception) are accurate.

                        Fill out the schema fields concisely. 
                        Focus on novel information which would be interesting to someone who already knows a lot about music.

                        Ensure a none conversational style, the output will be shown directly to the user.
                    `,
        });
        const analysis = JSON.parse(text) as AnalysisData
        const updatedTrack: TrackData = {
            ...track,
            loading: false,
            analysis: { ...analysis }
        }
        Store.updateCache(track.trackId, updatedTrack)
        Events.analysis.emit(Events.analysisDone, updatedTrack);
        console.log(`Finished research for ${track.name} - ${track.album} - ${track.artist}`)
    } catch (error) {
        console.error(`AI error for ${track.trackId}:`, error);
        Store.updateCache(track.trackId, { ...track, error: "Error retrieving research.", loading: false })
    }
}
