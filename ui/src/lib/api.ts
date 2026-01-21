import axios from 'axios';
import type { TrackData } from '../../../src/types';

export const analyseTrack = async (trackId: string) => {
    try {
      await axios.get(`/api/analyse?trackId=${trackId}`);
    } catch (error) {
      console.error("Analyse error", error);
    }
}

export const getCurrentTrack = async (): Promise<TrackData | null> => {
    try {
      const response = await axios.get('/api/now-playing');
      const track = response.data as TrackData | null
      return track
    } catch (error) {
      console.error("Now playing error", error);
      return null
    }
}

export const getHistory = async (): Promise<TrackData[]> => {
    try {
      const response = await axios.get('/api/history');
      const result = response.data;
      return result.history
    } catch (error) {
      console.error("Fetching history error", error)
      return []
    }
}


export const eventsURL = '/api/events';