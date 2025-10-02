/**
 * TypeScript type definitions for the Lead Service Line application
 */

export interface ServiceLineFeature {
  OBJECTID: number;
  Address: string;
  CustomerMaterial: string;
  SupplierMaterial: string;
  YearBuilt: number;
  Status: "VERIFIED" | "ASSUMED" | "UNKNOWN";
  LetterSent: boolean;
  LastUpdated?: Date;
  geometry?: {
    x: number;
    y: number;
  };
}

export interface Location {
  id: number;
  address: string;
  customerMaterial: string;
  supplierMaterial: string;
  letterSent: boolean;
  buildYear: number;
  status: string;
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  address: string;
  location: {
    x: number;
    y: number;
  };
  score: number;
  attributes: Record<string, any>;
}

export interface FilterOptions {
  material: "all" | "lead" | "unknown";
  showCustomer: boolean;
  showSupplier: boolean;
  status?: string[];
}

export interface MapConfig {
  center: [number, number];
  zoom: number;
  basemap: string;
}

export type MaterialType = "Lead" | "Copper" | "Galvanized Steel" | "Unknown" | string;
