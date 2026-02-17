import axios from 'axios';
import type { TrackDetails } from '../../../src/types';
import * as Paths from './paths';

export const analyseTrack = async (trackId: string) => {
  await axios.post(`${Paths.API}/analyse?trackId=${trackId}`);
}

export const getCurrentTrack = async (): Promise<TrackDetails | null> => {
  const response = await axios.get(`${Paths.API}/now-playing`);
  const track = response.data as TrackDetails | null
  return track
}

export const getHistory = async (): Promise<TrackDetails[]> => {
  const response = await axios.get(`${Paths.API}/history`);
  const result = response.data;
  return result.history
}

export const getRecentlyPlayed = async (): Promise<TrackDetails[]> => {
  const response = await axios.get(`${Paths.API}/recently-played`);
  const result = response.data;
  return result
}

export const getRelatedTracks = async (trackId: string): Promise<TrackDetails[]> => {
  const response = await axios.get(`${Paths.API}/related-tracks?trackId=${trackId}`);
  const result = response.data;
  return result
}

export const getNowPlaying = async (): Promise<TrackDetails | null> => {
  const response = await axios.get(`${Paths.API}/now-playing`);
  const track = response.data as TrackDetails | null
  return track
}
export const eventsURL = `${Paths.API}/events`;