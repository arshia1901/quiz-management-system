import { useState, useEffect, useRef, useCallback } from "react";
import { attemptsAPI } from "../api";

const TIMER_POLL_INTERVAL_MS = 15000;

export function useQuizSecurity({
  attemptId,
  initialSecondsLeft = 0,
  settings = {},
  onAutoSubmit,
  onViolationWarning,
}) {
  const [timeLeft, setTimeLeft]     = useState(initialSecondsLeft);
  const [violations, setViolations] = useState(0);

  const autoSubmittedRef   = useRef(false);
  const tabSwitchCount     = useRef(0);
  const mountedRef         = useRef(false);
  const submittingRef      = useRef(false);
  const questionEnteredRef = useRef(Date.now());

  const triggerAutoSubmit = useCallback((reason) => {
    if (autoSubmittedRef.current) return;
    if (submittingRef.current) return;
    autoSubmittedRef.current = true;
    onAutoSubmit && onAutoSubmit(reason);
  }, [onAutoSubmit]);

  // Logs violation to backend and WAITS for it to complete
  const logToBackendAndWait = useCallback(async (type, detail = "") => {
    if (!attemptId) return;
    try {
      const res = await attemptsAPI.violation(attemptId, type, detail);
      // Update local violation count from server response
      if (res && typeof res.violations === "number") {
        setViolations(res.violations);
      }
    } catch (_) {}
  }, [attemptId]);

  // Fire and forget version for non-critical events
  const logToBackend = useCallback((type, detail = "") => {
    logToBackendAndWait(type, detail);
  }, [logToBackendAndWait]);

  // ── 1. CLIENT COUNTDOWN TIMER ─────────────────────────────────────────────
  useEffect(() => {
    if (!attemptId || initialSecondsLeft <= 0) return;
    setTimeLeft(initialSecondsLeft);
    const tick = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(tick);
          triggerAutoSubmit("time_expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [attemptId, initialSecondsLeft]); // eslint-disable-line

  // ── 2. SERVER TIMER SYNC ──────────────────────────────────────────────────
  useEffect(() => {
    if (!attemptId) return;
    const poll = setInterval(async () => {
      try {
        const res = await attemptsAPI.syncTimer(attemptId);
        if (res.status === "completed" || res.auto_submitted) {
          triggerAutoSubmit("server_confirmed_expired");
          return;
        }
        setTimeLeft((prev) => {
          const diff = Math.abs(prev - res.seconds_left);
          return diff > 10 ? res.seconds_left : prev;
        });
      } catch (_) {}
    }, TIMER_POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [attemptId]); // eslint-disable-line

  // ── 3. TAB SWITCH — log first, then auto-submit ───────────────────────────
  useEffect(() => {
    if (!settings.tabDetect) return;

    const mountDelay = setTimeout(() => {
      mountedRef.current = true;
    }, 2000);

    const handleVisibility = async () => {
      if (!document.hidden || !mountedRef.current) return;
      if (submittingRef.current) return;

      tabSwitchCount.current += 1;
      setViolations(tabSwitchCount.current);

      // AWAIT the log so it's in DB before auto-submit fires
      await logToBackendAndWait("tab_switch", `switch #${tabSwitchCount.current}`);

      // Now trigger auto-submit
      triggerAutoSubmit("tab_switch");
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearTimeout(mountDelay);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [settings.tabDetect, logToBackendAndWait, triggerAutoSubmit]);

  // ── 4. COPY/PASTE BLOCK ───────────────────────────────────────────────────
  useEffect(() => {
    if (!settings.copyPaste) return;

    const block = (e) => {
      e.preventDefault();
      onViolationWarning && onViolationWarning("copy_paste", 1, 999);
      logToBackend("copy_paste", e.type);
    };

    document.addEventListener("copy",  block);
    document.addEventListener("cut",   block);
    document.addEventListener("paste", block);
    return () => {
      document.removeEventListener("copy",  block);
      document.removeEventListener("cut",   block);
      document.removeEventListener("paste", block);
    };
  }, [settings.copyPaste, logToBackend]);

  // ── 5. FULLSCREEN — log first, then auto-submit ───────────────────────────
  useEffect(() => {
    if (!settings.fullscreen) return;

    const t = setTimeout(() => {
      const el = document.documentElement;
      if (!document.fullscreenElement) {
        el.requestFullscreen && el.requestFullscreen().catch(() => {});
      }
    }, 500);

    const handleFSChange = async () => {
      if (!document.fullscreenElement && mountedRef.current && !submittingRef.current) {
        // AWAIT the log so it's in DB before auto-submit fires
        await logToBackendAndWait("fullscreen_exit", "exited fullscreen");
        triggerAutoSubmit("fullscreen_exit");
      }
    };

    document.addEventListener("fullscreenchange", handleFSChange);
    return () => {
      clearTimeout(t);
      document.removeEventListener("fullscreenchange", handleFSChange);
      if (document.fullscreenElement) {
        document.exitFullscreen && document.exitFullscreen().catch(() => {});
      }
    };
  }, [settings.fullscreen, logToBackendAndWait, triggerAutoSubmit]);

  // ── Question time tracking ────────────────────────────────────────────────
  const markQuestionEntered = useCallback(() => {
    questionEnteredRef.current = Date.now();
  }, []);

  const logQuestionExit = useCallback(async (questionId) => {
    if (!attemptId || !questionId) return;
    const ms = Date.now() - questionEnteredRef.current;
    try {
      await attemptsAPI.logQuestionTime(attemptId, questionId, ms);
    } catch (_) {}
  }, [attemptId]);

  const markSubmitting = useCallback(() => {
    submittingRef.current = true;
    if (document.fullscreenElement) {
      document.exitFullscreen && document.exitFullscreen().catch(() => {});
    }
  }, []);

  const containerProps = {
    style: { userSelect: "none", WebkitUserSelect: "none" },
    onDragStart: (e) => e.preventDefault(),
  };

  return {
    timeLeft,
    violations,
    containerProps,
    markQuestionEntered,
    logQuestionExit,
    markSubmitting,
  };
}