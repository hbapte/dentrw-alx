/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/axios";
import logger from "@/utils/logger";

interface SessionInfo {
  id: string;
  isCurrent: boolean;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
    isMobile?: boolean;
  };
  location?: {
    city?: string;
    country?: string;
    region?: string;
    timezone?: string;
  };
  ipAddress?: string;
  userAgent?: string;
  lastAccessedAt: Date;
  createdAt: Date;
  expires: Date;
}

export function useSessions() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = (await apiService.get("/api/auth/sessions")) as {
        data: { sessions: SessionInfo[] };
      };
      setSessions(response.data.sessions || []);
    } catch (error: any) {
      logger.error("Fetch sessions error:", error);
      setError(
        error.response?.data?.error?.message || "Failed to fetch sessions",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const terminateSession = async (sessionId: string): Promise<boolean> => {
    try {
      await apiService.delete(`/api/auth/sessions/${sessionId}`);

      // Remove session from local state
      setSessions((prev) => prev.filter((session) => session.id !== sessionId));

      return true;
    } catch (error: any) {
      logger.error("Terminate session error:", error);
      setError(
        error.response?.data?.error?.message || "Failed to terminate session",
      );
      return false;
    }
  };

  const refreshSessions = () => {
    fetchSessions();
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return {
    sessions,
    isLoading,
    error,
    terminateSession,
    refreshSessions,
  };
}
