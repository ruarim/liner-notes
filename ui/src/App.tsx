import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import type { TrackData } from '../../src/types';
import SpotifyLogin from './components/spotify-login';
import Loading from './components/loading';
import Home from './components/home';

function App() {
  const [history, setHistory] = useState<TrackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/history');
      const result = response.data;

      if (result.error === 'Not logged in' || response.status === 401) {
        setIsLoggedIn(false);
        return;
      }

      setHistory(result.history)
      return result.history
    } catch (error) {
      setLoading(false);
    }
  }
  const pollCurrentlyPlaying = async () => {
    try {
      const response = await axios.get('/api/now-playing');
      const track = response.data as TrackData | null 
      setIsLoggedIn(true);
      if(track === null) return
      setHistory((prev) => {
        if (prev.length === 0) {
          return [track];
        }
        const lastTrack = prev[prev.length - 1];
        if (track.trackId !== lastTrack.trackId) {
          return [...prev, track];
        }
        return prev;
      });
    } catch (error) {
      console.error("Polling error", error);
      // If we get a 401 here, the session probably expired
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setIsLoggedIn(false);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchHistory()
      pollCurrentlyPlaying()
      pollInterval.current = setInterval(pollCurrentlyPlaying, 5000);
      setLoading(false);
    }
    fetchData();
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if(!isLoggedIn) return
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as TrackData;
      setHistory(prev =>
        prev.map(p => p.trackId == data.trackId
          ? data
          : p
        )
      )
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
    };

    return () => { eventSource.close() };
  }, [isLoggedIn]);

  if (loading) return <Loading />;
  if (!isLoggedIn) return <SpotifyLogin />;

  return <Home data={history} />;
}

export default App;
