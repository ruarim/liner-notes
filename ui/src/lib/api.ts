import axios from 'axios';
import type { TrackData } from '../../../src/types';

export const analyseTrack = async (trackId: string) => {
  await axios.get(`/api/analyse?trackId=${trackId}`);
}

export const getCurrentTrack = async (): Promise<TrackData | null> => {
  const response = await axios.get('/api/now-playing');
  const track = response.data as TrackData | null
  return track
}

export const getHistory = async (): Promise<TrackData[]> => {
  const response = await axios.get('/api/history');
  const result = response.data;
  return result.history
}


export const eventsURL = '/api/events';