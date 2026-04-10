import { useState, useEffect, useCallback } from "react";
import { getReports } from "../api";

// Polls the backend every POLL_MS milliseconds for live updates.
// Replace polling with a WebSocket / SSE connection for real-time push.
const POLL_MS = 5_000;

export function useReports() {
  const [reports, setReports] = useState([]);
  const [stats,   setStats]   = useState({ total: 0, pending: 0, inProgress: 0, cleaned: 0 });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

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

  // Initial load + polling
  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchReports]);

  return { reports, stats, loading, error, refresh: fetchReports };
}
