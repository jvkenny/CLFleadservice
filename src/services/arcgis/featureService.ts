/**
 * ArcGIS Feature Service Integration
 *
 * Handles querying and data retrieval from ArcGIS Online Feature Services
 */

import { arcgisConfig } from "../../config/arcgis.config";
import { authService } from "./auth";
import type { ServiceLineFeature, Location, FilterOptions } from "../types";

/**
 * Convert ArcGIS feature to application Location format
 */
function featureToLocation(feature: any): Location {
  const attrs = feature.attributes;
  const geometry = feature.geometry;

  return {
    id: attrs.OBJECTID,
    address: attrs.Address || "Unknown Address",
    customerMaterial: attrs.CustomerMaterial || "Unknown",
    supplierMaterial: attrs.SupplierMaterial || "Unknown",
    letterSent: attrs.LetterSent === 1 || attrs.LetterSent === true,
    buildYear: attrs.YearBuilt || 0,
    status: attrs.Status || "UNKNOWN",
    lat: geometry?.y || 0,
    lng: geometry?.x || 0,
  };
}

/**
 * Build WHERE clause from filter options
 */
function buildWhereClause(filters: FilterOptions): string {
  const conditions: string[] = [];

  if (filters.material === "lead") {
    conditions.push(
      "(CustomerMaterial = 'Lead' OR SupplierMaterial = 'Lead')"
    );
  } else if (filters.material === "unknown") {
    conditions.push(
      "(CustomerMaterial = 'Unknown' OR SupplierMaterial = 'Unknown')"
    );
  }

  if (filters.status && filters.status.length > 0) {
    const statusList = filters.status.map((s) => `'${s}'`).join(",");
    conditions.push(`Status IN (${statusList})`);
  }

  return conditions.length > 0 ? conditions.join(" AND ") : "1=1";
}

/**
 * Query features from the Feature Service
 */
export async function queryFeatures(
  filters: FilterOptions = { material: "all", showCustomer: true, showSupplier: true }
): Promise<Location[]> {
  const where = buildWhereClause(filters);

  const params = new URLSearchParams({
    where: where,
    outFields: "*",
    returnGeometry: "true",
    f: "json",
    outSR: "4326", // WGS84
  });

  // Add authentication token if available
  const token = authService.getAccessToken();
  if (token) {
    params.append("token", token);
  }

  const url = `${arcgisConfig.featureServiceUrl}/query?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Feature service query failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`ArcGIS Error: ${data.error.message}`);
    }

    return data.features.map(featureToLocation);
  } catch (error) {
    console.error("Failed to query features:", error);
    throw error;
  }
}

/**
 * Query a single feature by OBJECTID
 */
export async function queryFeatureById(objectId: number): Promise<Location | null> {
  const params = new URLSearchParams({
    where: `OBJECTID = ${objectId}`,
    outFields: "*",
    returnGeometry: "true",
    f: "json",
    outSR: "4326",
  });

  const token = authService.getAccessToken();
  if (token) {
    params.append("token", token);
  }

  const url = `${arcgisConfig.featureServiceUrl}/query?${params}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(`ArcGIS Error: ${data.error.message}`);
    }

    if (data.features.length > 0) {
      return featureToLocation(data.features[0]);
    }

    return null;
  } catch (error) {
    console.error("Failed to query feature by ID:", error);
    return null;
  }
}

/**
 * Query features within a geographic extent
 */
export async function queryFeaturesInExtent(
  extent: { xmin: number; ymin: number; xmax: number; ymax: number },
  filters: FilterOptions = { material: "all", showCustomer: true, showSupplier: true }
): Promise<Location[]> {
  const where = buildWhereClause(filters);
  const geometryString = `${extent.xmin},${extent.ymin},${extent.xmax},${extent.ymax}`;

  const params = new URLSearchParams({
    where: where,
    geometry: geometryString,
    geometryType: "esriGeometryEnvelope",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "*",
    returnGeometry: "true",
    f: "json",
    outSR: "4326",
  });

  const token = authService.getAccessToken();
  if (token) {
    params.append("token", token);
  }

  const url = `${arcgisConfig.featureServiceUrl}/query?${params}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(`ArcGIS Error: ${data.error.message}`);
    }

    return data.features.map(featureToLocation);
  } catch (error) {
    console.error("Failed to query features in extent:", error);
    throw error;
  }
}

/**
 * Get statistics about the features
 */
export async function getFeatureStats(): Promise<{
  total: number;
  lead: number;
  unknown: number;
  verified: number;
  assumed: number;
}> {
  // Query for counts
  const params = new URLSearchParams({
    where: "1=1",
    returnGeometry: "false",
    returnCountOnly: "false",
    outFields: "CustomerMaterial,SupplierMaterial,Status",
    f: "json",
  });

  const token = authService.getAccessToken();
  if (token) {
    params.append("token", token);
  }

  const url = `${arcgisConfig.featureServiceUrl}/query?${params}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(`ArcGIS Error: ${data.error.message}`);
    }

    const features = data.features;

    return {
      total: features.length,
      lead: features.filter(
        (f: any) =>
          f.attributes.CustomerMaterial === "Lead" ||
          f.attributes.SupplierMaterial === "Lead"
      ).length,
      unknown: features.filter(
        (f: any) =>
          f.attributes.CustomerMaterial === "Unknown" ||
          f.attributes.SupplierMaterial === "Unknown"
      ).length,
      verified: features.filter((f: any) => f.attributes.Status === "VERIFIED").length,
      assumed: features.filter((f: any) => f.attributes.Status === "ASSUMED").length,
    };
  } catch (error) {
    console.error("Failed to get feature stats:", error);
    return {
      total: 0,
      lead: 0,
      unknown: 0,
      verified: 0,
      assumed: 0,
    };
  }
}
