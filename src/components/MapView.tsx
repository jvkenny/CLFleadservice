/**
 * MapView Component
 *
 * Integrates ArcGIS Maps SDK for JavaScript with React
 * Displays feature service data on an interactive map
 *
 * Note: This is a placeholder that uses REST API until @arcgis/core is installed
 */

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import type { Location } from "../services/types";

interface MapViewProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  center?: [number, number];
  zoom?: number;
}

export default function MapView({
  locations,
  selectedLocation,
  onLocationSelect,
  center = [-87.8, 42.1],
  zoom = 13,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // This is a placeholder implementation
    // Once @arcgis/core is installed, replace this with actual ArcGIS MapView

    if (!mapRef.current) return;

    console.log("MapView initialized with", locations.length, "locations");
    console.log("Center:", center, "Zoom:", zoom);

    // TODO: Initialize ArcGIS Map and MapView here
    /*
    import Map from "@arcgis/core/Map";
    import MapView from "@arcgis/core/views/MapView";
    import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

    const map = new Map({
      basemap: "gray-vector"
    });

    const view = new MapView({
      container: mapRef.current,
      map: map,
      center: center,
      zoom: zoom
    });

    // Add feature layer
    // Setup click handlers
    // Etc.
    */

  }, [locations, center, zoom]);

  return (
    <div ref={mapRef} className="w-full h-full relative bg-stone-200">
      {/* Placeholder until ArcGIS SDK is installed */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="text-center p-12 bg-white/95 backdrop-blur rounded-2xl shadow-xl max-w-2xl border-2 border-emerald-600">
          <MapPin className="w-20 h-20 mx-auto mb-6 text-emerald-600" />
          <h3 className="text-2xl font-semibold text-emerald-700 mb-4">
            ArcGIS Map View
          </h3>
          <p className="text-lg text-stone-700 mb-6 leading-relaxed">
            Install <code className="bg-stone-100 px-2 py-1 rounded">@arcgis/core</code> to
            enable the interactive map.
          </p>
          <div className="text-left bg-stone-50 p-4 rounded-lg mb-4">
            <code className="text-sm text-stone-800">
              npm install @arcgis/core
            </code>
          </div>
          <p className="text-sm text-stone-600">
            {locations.length} location{locations.length !== 1 ? 's' : ''} ready to display
          </p>
          {mapError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {mapError}
            </div>
          )}
        </div>
      </div>

      {/* Grid overlay showing location points (temporary visualization) */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg text-xs">
        <div className="font-semibold text-stone-700 mb-2">Location Preview</div>
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {locations.slice(0, 10).map((loc) => (
            <button
              key={loc.id}
              onClick={() => onLocationSelect(loc)}
              className={`block w-full text-left px-2 py-1 rounded text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors ${
                selectedLocation?.id === loc.id ? 'bg-emerald-100 text-emerald-700 font-semibold' : ''
              }`}
            >
              <MapPin className="w-3 h-3 inline mr-1" />
              {loc.address}
            </button>
          ))}
          {locations.length > 10 && (
            <div className="text-stone-500 italic px-2 py-1">
              ...and {locations.length - 10} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
