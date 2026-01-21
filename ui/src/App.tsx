import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import type { TrackData } from '../../src/types';
import Home from './components/home';
import * as Api from './lib/api';

function App() {
  const [history, setHistory] = useState<TrackData[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const pollCurrentlyPlaying = async () => {
    try {
      const track = await Api.getCurrentTrack()
      setIsLoggedIn(true);
      if (track === null) return
      setHistory((prev) => {
        if (prev.length === 0) {
          return [track];
        }
        const firstTrack = prev[0];
        if (track.trackId !== firstTrack.trackId) {
          return [track, ...prev];
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

  const fetchHistory = async () => {
    try {
      const history = await Api.getHistory()
      if (history.length === 0) {
        setIsLoggedIn(false);
        return;
      }
      setHistory(history.reverse())
    } catch (error) {
      console.error("Fetching history error", error)
    }
  }

  useEffect(() => { fetchHistory() }, [isLoggedIn]);
  useEffect(() => {
    const runAnalysis = async () => {
      if (!isAnalyzing) return
      pollCurrentlyPlaying()
      pollInterval.current = setInterval(pollCurrentlyPlaying, 5000);
    }
    runAnalysis();
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [isLoggedIn, isAnalyzing]);

  useEffect(() => {
    if (!isLoggedIn) return
    const eventSource = new EventSource(Api.eventsURL);

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

  return <Home
    data={history}
    isAnalyzing={isAnalyzing}
    setAnalyzing={setIsAnalyzing}
    isLoggedIn={isLoggedIn}
  />;
}

export default App;
