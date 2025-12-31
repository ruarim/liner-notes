import { AnalysisData } from "./types";

export const analysisCache = new Map<string, { status: string; data: AnalysisData | null }>();