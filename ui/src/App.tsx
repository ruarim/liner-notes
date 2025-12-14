import { useState, useEffect } from 'react';
import axios from 'axios';
import type { TrackData } from '../../src/types';
import SpotifyLogin from './components/spotify-login';
import Loading from './components/loading';
import Home from './components/home';

function App() {
  const [data, setData] = useState<Array<TrackData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/now-playing');
        const result = response.data as TrackData;

        if (result.error === 'Not logged in') {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        setIsLoggedIn(true);

        setData((prev) => {
          if (!prev || prev.length === 0) {
            return [result];
          }

          const lastTrack = prev[prev.length - 1];
          if (result.trackId !== lastTrack.trackId) {
            return [...prev, result];
          }

          // B. Same Track, but maybe Analysis updated? -> Update last item
          // (Optional, but good for avoiding "Loading..." getting stuck)
          if (JSON.stringify(result.analysis) !== JSON.stringify(lastTrack.analysis)) {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = result;
            return newHistory;
          }

          return prev;
        });

        setLoading(false);

      } catch (error) {
        console.error("Polling error", error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Poll every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loading />
  if (!isLoggedIn) return <SpotifyLogin />

  if (data) return <Home data={data} />
}

export default App;