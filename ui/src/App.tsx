import { useState, useEffect } from 'react';
import axios from 'axios';
import type { TrackDetails } from '../../src/types';
import Home from './components/home';
import * as Api from './lib/api';
import { ThemeProvider } from 'next-themes';

function App() {
  const [history, setHistory] = useState<TrackDetails[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchHistory = async () => {
    try {
      const history = await Api.getHistory()
      setHistory(history.reverse())
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

  useEffect(() => { fetchHistory() }, []);
  useEffect(() => {
    if (!isLoggedIn) return
    const eventSource = new EventSource(Api.eventsURL);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as TrackDetails;
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
