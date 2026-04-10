import { useState, useEffect, useCallback, useRef } from "react";
import { getReports, SSE_URL } from "../api";

// Uses Server-Sent Events for real-time, event-driven updates.
// Falls back to initial HTTP fetch if SSE fails.

export function useReports() {
  const [reports,     setReports]     = useState([]);
  const [stats,       setStats]       = useState({ total: 0, pending: 0, inProgress: 0, cleaned: 0, pendingProof: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const eventSourceRef = useRef(null);

  // Manual refresh fallback
  const fetchReports = useCallback(async () => {
    try {
      const { data } = await getReports();
      setReports(data.data);
      setStats(data.stats);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // SSE connection
  useEffect(() => {
    const es = new EventSource(SSE_URL);
    eventSourceRef.current = es;

    es.addEventListener("update", (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.reports) setReports(payload.reports);
        if (payload.stats) setStats(payload.stats);
        if (payload.leaderboard) setLeaderboard(payload.leaderboard);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    });

    es.onerror = () => {
      // On SSE error, fall back to HTTP fetch
      console.warn("SSE connection error, falling back to HTTP fetch");
      setError(null);
      fetchReports();
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [fetchReports]);

  return { reports, stats, leaderboard, loading, error, refresh: fetchReports };
}
