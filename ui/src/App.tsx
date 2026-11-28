import { useState, useEffect } from 'react';
import axios from 'axios';
import type { TrackDetails } from '../../src/types';
import Home from './components/home';
import * as Api from './lib/api';
import { ThemeProvider } from 'next-themes';

const HISTORY_POLL_INTERVAL_MS = 5000;

function App() {
  const [history, setHistory] = useState<TrackDetails[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const fetched = await Api.getHistory()
        const incoming = [...fetched].reverse()
        setHistory(prev => {
          if (prev.length === 0) return incoming
          const incomingById = new Map(incoming.map(t => [t.trackId, t]))
          const prevById = new Map(prev.map(t => [t.trackId, t]))
          const updated = prev
            .filter(t => incomingById.has(t.trackId))
            .map(t => {
              const next = incomingById.get(t.trackId)!
              return JSON.stringify(t) === JSON.stringify(next) ? t : next
            })
          const added = incoming.filter(t => !prevById.has(t.trackId))
          const merged = [...added, ...updated]
          return merged.length === prev.length && merged.every((t, i) => t === prev[i])
            ? prev
            : merged
        })
        // If we successfully fetched history, we're logged in
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Fetching history error", error)
        // If we get a 401/404, we're not logged in
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 404)) {
          setIsLoggedIn(false);
        }
      }
    }

    fetchHistory()
    if (!isLoggedIn) return
    const interval = setInterval(fetchHistory, HISTORY_POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [isLoggedIn]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <Home
        history={history}
        isLoggedIn={isLoggedIn}
        setHistory={setHistory}
      />
    </ThemeProvider>)
}

export default App;
