import { useState, useRef, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";

export function useWindowTimer(jobId: string | null) {
  const db = useSQLiteContext();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    startRef.current = Date.now();
    endRef.current = null;
    setElapsed(0);
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current!) / 1000));
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    endRef.current = Date.now();
    setIsRunning(false);
  }, []);

  const save = useCallback(async () => {
    if (!startRef.current || !endRef.current) return;
    const startedAt = new Date(startRef.current).toISOString();
    const endedAt = new Date(endRef.current).toISOString();
    const duration = Math.floor((endRef.current - startRef.current) / 1000);
    const id = `wt_${Date.now()}`;
    await db.runAsync(
      `INSERT INTO window_timings (id, job_id, started_at, ended_at, duration_seconds)
       VALUES (?, ?, ?, ?, ?)`,
      [id, jobId, startedAt, endedAt, duration]
    );
    startRef.current = null;
    endRef.current = null;
    setElapsed(0);
  }, [db, jobId]);

  const discard = useCallback(() => {
    startRef.current = null;
    endRef.current = null;
    setElapsed(0);
  }, []);

  return { isRunning, elapsed, start, stop, save, discard };
}
