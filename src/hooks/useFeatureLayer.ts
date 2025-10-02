/**
 * useFeatureLayer Hook
 *
 * React hook for querying and managing ArcGIS Feature Layer data
 */

import { useState, useEffect, useCallback } from "react";
import { queryFeatures, getFeatureStats } from "../services/arcgis/featureService";
import type { Location, FilterOptions } from "../services/types";

interface UseFeatureLayerResult {
  locations: Location[];
  stats: {
    total: number;
    lead: number;
    unknown: number;
    verified: number;
    assumed: number;
  };
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFeatureLayer(
  filters: FilterOptions = { material: "all", showCustomer: true, showSupplier: true }
): UseFeatureLayerResult {
  const [locations, setLocations] = useState<Location[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    lead: 0,
    unknown: 0,
    verified: 0,
    assumed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [locationsData, statsData] = await Promise.all([
        queryFeatures(filters),
        getFeatureStats(),
      ]);

      setLocations(locationsData);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load feature data";
      setError(errorMessage);
      console.error("Feature layer error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    locations,
    stats,
    loading,
    error,
    refetch: fetchData,
  };
}
