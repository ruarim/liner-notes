import { useState, useEffect } from 'react';
import axios from 'axios';
import type { TrackData } from '../../src/types';
import SpotifyLogin from './components/spotify-login';
import Loading from './components/loading';
import Home from './components/home';

function App() {
  const [data, setData] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Poll Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/now-playing');
        const result = response.data;

        if (result.error === 'Not logged in') {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        setIsLoggedIn(true);
        setData(result);
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

  if(data) return <Home data={data}/>;

  return <>Failed</>;
}

export default App;