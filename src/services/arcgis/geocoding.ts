/**
 * ArcGIS Geocoding Service
 *
 * Provides address search and geocoding functionality using the ArcGIS World Geocoding Service
 */

import { arcgisConfig } from "../../config/arcgis.config";
import type { GeocodeResult } from "../types";

/**
 * Search for addresses using the geocoding service
 */
export async function geocodeAddress(
  searchText: string,
  center?: { x: number; y: number }
): Promise<GeocodeResult[]> {
  if (!searchText || searchText.length < 3) {
    return [];
  }

  const params = new URLSearchParams({
    SingleLine: searchText,
    f: "json",
    outFields: "*",
    maxLocations: "10",
    outSR: "4326", // WGS84
  });

  // Prioritize results near the map center (Lake Forest area)
  if (center) {
    params.append("location", `${center.x},${center.y}`);
  } else {
    // Default to Lake Forest center
    params.append("location", `${arcgisConfig.map.center[0]},${arcgisConfig.map.center[1]}`);
  }

  // Optionally add search extent to limit results to Lake Forest area
  // Example: searchExtent: xmin,ymin,xmax,ymax

  const url = `${arcgisConfig.geocodeServiceUrl}/findAddressCandidates?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`ArcGIS Geocoding Error: ${data.error.message}`);
    }

    return data.candidates.map((candidate: any) => ({
      address: candidate.address,
      location: {
        x: candidate.location.x,
        y: candidate.location.y,
      },
      score: candidate.score,
      attributes: candidate.attributes,
    }));
  } catch (error) {
    console.error("Geocoding failed:", error);
    return [];
  }
}

/**
 * Get address suggestions for autocomplete
 */
export async function getSuggestions(
  searchText: string,
  center?: { x: number; y: number }
): Promise<Array<{ text: string; magicKey: string }>> {
  if (!searchText || searchText.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    text: searchText,
    f: "json",
    maxSuggestions: "8",
  });

  if (center) {
    params.append("location", `${center.x},${center.y}`);
  } else {
    params.append("location", `${arcgisConfig.map.center[0]},${arcgisConfig.map.center[1]}`);
  }

  const url = `${arcgisConfig.geocodeServiceUrl}/suggest?${params}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("Suggestion error:", data.error);
      return [];
    }

    return data.suggestions || [];
  } catch (error) {
    console.error("Failed to get suggestions:", error);
    return [];
  }
}

/**
 * Find address using magic key from suggestion
 */
export async function findAddressFromMagicKey(
  magicKey: string
): Promise<GeocodeResult | null> {
  const params = new URLSearchParams({
    magicKey: magicKey,
    f: "json",
    outSR: "4326",
    outFields: "*",
  });

  const url = `${arcgisConfig.geocodeServiceUrl}/findAddressCandidates?${params}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error || !data.candidates || data.candidates.length === 0) {
      return null;
    }

    const candidate = data.candidates[0];

    return {
      address: candidate.address,
      location: {
        x: candidate.location.x,
        y: candidate.location.y,
      },
      score: candidate.score,
      attributes: candidate.attributes,
    };
  } catch (error) {
    console.error("Failed to find address from magic key:", error);
    return null;
  }
}

/**
 * Reverse geocode: get address from coordinates
 */
export async function reverseGeocode(
  x: number,
  y: number
): Promise<string | null> {
  const params = new URLSearchParams({
    location: `${x},${y}`,
    f: "json",
    outSR: "4326",
  });

  const url = `${arcgisConfig.geocodeServiceUrl}/reverseGeocode?${params}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error || !data.address) {
      return null;
    }

    return data.address.LongLabel || data.address.Address;
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return null;
  }
}
