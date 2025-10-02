/**
 * useArcGISAuth Hook
 *
 * React hook for managing ArcGIS OAuth authentication
 */

import { useState, useEffect, useCallback } from "react";
import { authService } from "../services/arcgis/auth";

interface UseArcGISAuthResult {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
}

export function useArcGISAuth(): UseArcGISAuthResult {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for OAuth callback on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we're returning from OAuth callback
        const hadCallback = await authService.checkForCallback();

        // Update authentication status
        setIsAuthenticated(authService.isAuthenticated());

        if (hadCallback) {
          console.log("OAuth authentication successful");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Authentication failed";
        setError(errorMessage);
        console.error("Auth error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async () => {
    try {
      setError(null);
      await authService.login();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      console.error("Login error:", err);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setError(null);
  }, []);

  return {
    isAuthenticated,
    loading,
    error,
    login,
    logout,
  };
}
