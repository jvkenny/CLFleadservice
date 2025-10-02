/**
 * ArcGIS Online Configuration
 *
 * This file contains all ArcGIS-related configuration.
 * Environment variables should be set in .env.local
 */

export const arcgisConfig = {
  // Feature Service Configuration
  featureServiceUrl: import.meta.env.VITE_ARCGIS_FEATURE_SERVICE_URL || "",
  layerId: parseInt(import.meta.env.VITE_ARCGIS_LAYER_ID || "0"),
  maxFeatures: parseInt(import.meta.env.VITE_ARCGIS_MAX_FEATURES || "10000"),

  // OAuth Configuration (for private layers)
  oauth: {
    clientId: import.meta.env.VITE_ARCGIS_CLIENT_ID || "",
    portalUrl: import.meta.env.VITE_ARCGIS_PORTAL_URL || "https://www.arcgis.com",
    redirectUri: import.meta.env.VITE_ARCGIS_REDIRECT_URI || window.location.origin,
    popup: false, // Use redirect flow instead of popup
  },

  // Geocoding Service
  geocodeServiceUrl:
    import.meta.env.VITE_ARCGIS_GEOCODE_SERVICE_URL ||
    "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",

  // Map Configuration
  map: {
    center: [-87.8, 42.1] as [number, number], // Lake Forest, IL
    zoom: 13,
    basemap: "gray-vector",
    spatialReference: {
      wkid: 102100, // Web Mercator
    },
  },

  // Feature Layer Symbology
  symbology: {
    lead: {
      color: [217, 119, 6, 0.8], // Amber
      size: 10,
      outline: {
        color: [180, 83, 9, 1],
        width: 1.5,
      },
    },
    copper: {
      color: [5, 150, 105, 0.8], // Emerald
      size: 8,
      outline: {
        color: [4, 120, 87, 1],
        width: 1,
      },
    },
    unknown: {
      color: [107, 114, 128, 0.7], // Gray
      size: 8,
      outline: {
        color: [75, 85, 99, 1],
        width: 1,
      },
    },
    default: {
      color: [59, 130, 246, 0.7], // Blue
      size: 8,
      outline: {
        color: [37, 99, 235, 1],
        width: 1,
      },
    },
  },

  // Clustering configuration for performance
  clustering: {
    enabled: true,
    clusterRadius: 60,
    clusterMaxZoom: 16,
  },
};

// Validate required configuration
export const validateConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!arcgisConfig.featureServiceUrl) {
    errors.push("VITE_ARCGIS_FEATURE_SERVICE_URL is required");
  }

  // OAuth is optional, only validate if clientId is provided
  if (arcgisConfig.oauth.clientId && !arcgisConfig.oauth.redirectUri) {
    errors.push("VITE_ARCGIS_REDIRECT_URI is required when using OAuth");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
