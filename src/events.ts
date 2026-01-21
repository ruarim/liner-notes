import { EventEmitter } from 'events';
import { Request, Response } from 'express';
import * as Store from './store';
import { TrackData } from './types';

export const analysis = new EventEmitter();
export const analysisUpdate = 'analysis-update'

export const setupAnalysisSSE = (req: Request, res: Response, spotifyId: string) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const listener = async (data: TrackData) => {
        const userHistory = await Store.getTrackHistory(spotifyId);
        const isRelevant = userHistory.some(t => t.trackId === data.trackId);
        if (!isRelevant) return;
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    analysis.on(analysisUpdate, listener);

    req.on('close', () => {
        analysis.off(analysisUpdate, listener);
        res.end();
    });
}   