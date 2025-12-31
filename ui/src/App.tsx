import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import type { TrackData } from '../../src/types'; // Assuming this matches the backend response
import SpotifyLogin from './components/spotify-login';
import Loading from './components/loading';
import Home from './components/home';

function App() {
  const [history, setHistory] = useState<TrackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/now-playing');
      const result = response.data;

      if (result.error === 'Not logged in' || response.status === 401) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);
      setLoading(false);

      // 2. Handle "Not Playing" state
      if (!result.is_playing || !result.trackId) {
        return;
      }

      setHistory((prev) => {
        if (prev.length === 0) {
          return [result];
        }

        const lastTrack = prev[prev.length - 1];

        // Scenario A: It's a brand new song
        if (result.trackId !== lastTrack.trackId) {
          return [...prev, result];
        }

        // Scenario B: Same song, but check if analysis/status updated
        // We update the last item if the status changed (e.g., from "Researching..." to "complete")
        if (result.status !== lastTrack.status || JSON.stringify(result.analysis) !== JSON.stringify(lastTrack.analysis)) {
          const updatedHistory = [...prev];
          updatedHistory[updatedHistory.length - 1] = result;
          return updatedHistory;
        }

        return prev;
      });

    } catch (error) {
      console.error("Polling error", error);
      // If we get a 401 here, the session probably expired
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setIsLoggedIn(false);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    pollInterval.current = setInterval(fetchData, 5000);

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  if (loading) return <Loading />;
  if (!isLoggedIn) return <SpotifyLogin />;

  return <Home data={history} />;
}

export default App;