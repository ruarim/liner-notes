import { google } from "@ai-sdk/google";
import { generateText, Output, stepCountIs } from "ai";
import { z } from 'zod';
import { AnalysisData } from "./types";
import { analysisCache } from "./store";

export async function getTrackAnalysis(trackName: string, artistName: string, albumName: string, releaseDate: string, trackId: string) {
    if (analysisCache.has(trackId)) return;

    analysisCache.set(trackId, { status: "Researching...", data: null });
    console.log(`Starting research for ${trackName} - ${albumName} - ${artistName}`)

    try {
        const { text } = await generateText({
            model: google("gemini-3-pro-preview"),
            experimental_output: Output.object({
                schema: z.object({
                    albumAnalysis: z.string().describe("Analysis of the album's release, critical reception, and production style."),
                    personnelAndPlaces: z.string().describe("Details on the people (producers, musicians) and places (studios, cities) involved."),
                    artistBiography: z.string().describe("Biography focusing on where the artist was in their career during this specific era."),
                    culturalContext: z.string().describe("The musical scene, genre movements, or cultural climate of the time."),
                    recommendations: z.array(z.string()).describe("Distinct, actionable recommendations (books, albums, or tracks), with reasoning."),
                })
            }),
            tools: {
                google_search: google.tools.googleSearch({}),
            },
            stopWhen: stepCountIs(3),
            prompt: `
                        You are an expert musicologist and historian. 
                        Analyze the song "${trackName}" by "${artistName}" from the album "${albumName}" (${releaseDate || 'unknown date'}).

                        Use the Google Search tool to ensure your factual details (dates, personnel, reception) are accurate.

                        Fill out the schema fields concisely (approx 40-50 words per section).
                    `,
        });

        analysisCache.set(trackId, {
            status: 'complete',
            data: JSON.parse(text) as AnalysisData
        });
    } catch (error) {
        console.error(`AI error for ${trackId}:`, error);
        analysisCache.set(trackId, { status: "Error retrieving research.", data: null });
    }
}
