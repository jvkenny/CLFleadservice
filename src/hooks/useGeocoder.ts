/**
 * useGeocoder Hook
 *
 * React hook for address search and geocoding
 */

import { useState, useCallback } from "react";
import { geocodeAddress, getSuggestions } from "../services/arcgis/geocoding";
import type { GeocodeResult } from "../services/types";

interface UseGeocoderResult {
  results: GeocodeResult[];
  suggestions: Array<{ text: string; magicKey: string }>;
  loading: boolean;
  error: string | null;
  search: (text: string, center?: { x: number; y: number }) => Promise<void>;
  getSuggestions: (text: string, center?: { x: number; y: number }) => Promise<void>;
  clearResults: () => void;
}

export function useGeocoder(): UseGeocoderResult {
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [suggestions, setSuggestions] = useState<Array<{ text: string; magicKey: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (text: string, center?: { x: number; y: number }) => {
    if (!text || text.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const geocodeResults = await geocodeAddress(text, center);
      setResults(geocodeResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Geocoding failed";
      setError(errorMessage);
      console.error("Geocoding error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async (text: string, center?: { x: number; y: number }) => {
    if (!text || text.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const suggestionResults = await getSuggestions(text, center);
      setSuggestions(suggestionResults);
    } catch (err) {
      console.error("Suggestion error:", err);
      setSuggestions([]);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    results,
    suggestions,
    loading,
    error,
    search,
    getSuggestions: fetchSuggestions,
    clearResults,
  };
}
