import axios from 'axios';
import type { TrackDetails } from '../../../src/types';

export const analyseTrack = async (trackId: string) => {
  await axios.get(`/api/analyse?trackId=${trackId}`);
}

export const getCurrentTrack = async (): Promise<TrackDetails | null> => {
  const response = await axios.get('/api/now-playing');
  const track = response.data as TrackDetails | null
  return track
}

export const getHistory = async (): Promise<TrackDetails[]> => {
  const response = await axios.get('/api/history');
  const result = response.data;
  return result.history
}

export const getRecentlyPlayed = async (): Promise<TrackDetails[]> => {
  const response = await axios.get('/api/recently-played');
  const result = response.data;
  return result
}

export const eventsURL = '/api/events';