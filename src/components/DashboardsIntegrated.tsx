/**
 * Integrated Dashboard with ArcGIS Feature Service
 *
 * This is the PRODUCTION VERSION of the dashboard that integrates with real ArcGIS data.
 * To use this version:
 * 1. Set up your .env.local with ArcGIS credentials (see .env.example)
 * 2. Rename this file to Dashboards.tsx (backup the mock version first)
 * 3. Install @arcgis/core: npm install @arcgis/core
 */

import { useState } from "react";
import { Search, MapPin, Info, X, Home, Droplet, Box } from "lucide-react";
import MapView from "./MapView";
import { useFeatureLayer } from "../hooks/useFeatureLayer";
import { useGeocoder } from "../hooks/useGeocoder";
import { useArcGISAuth } from "../hooks/useArcGISAuth";
import type { Location, FilterOptions } from "../services/types";

// Lake Forest municipal colors
const LF_GREEN = "#2d5f3f";
const LF_LIGHT_GREEN = "#e8f3ed";
const LF_MEDIUM_GREEN = "#4a7c5d";
const LF_DARK_GREEN = "#1a3a28";
const LF_MUTED_GREEN = "#d4e5db";

const MATERIAL_LABEL = (code: string | null | undefined): string => {
  if (code == null) return "Not determined";
  const v = String(code).toLowerCase();
  if (["lead", "pb", "l"].includes(v)) return "Lead";
  if (["copper", "cu"].includes(v)) return "Copper";
  if (["galv", "galvanized"].includes(v)) return "Galvanized Steel";
  if (["unknown", "unk", "u", ""].includes(v)) return "Not determined";
  return String(code);
};

const getMaterialColor = (material: string): string => {
  const m = String(material).toLowerCase();
  if (["lead", "pb", "l"].includes(m)) return "text-amber-700 bg-amber-50 border-amber-200";
  if (["copper", "cu"].includes(m)) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (["galv", "galvanized"].includes(m)) return "text-slate-700 bg-slate-50 border-slate-200";
  return "text-gray-600 bg-gray-50 border-gray-200";
};

export default function LsiViewer() {
  const [selected, setSelected] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [filterMaterial, setFilterMaterial] = useState<"all" | "lead" | "unknown">("all");

  // ArcGIS Hooks
  const filterOptions: FilterOptions = {
    material: filterMaterial,
    showCustomer: true,
    showSupplier: true,
  };

  const { locations, stats, loading, error, refetch } = useFeatureLayer(filterOptions);
  const { search, results, loading: searchLoading } = useGeocoder();
  const { isAuthenticated, login, logout } = useArcGISAuth();

  // Filter locations by search term (client-side filtering on top of server filter)
  const filteredLocations = locations.filter((loc) => {
    if (searchTerm && !loc.address.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Handle search input
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.length >= 3) {
      search(value);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col" style={{ backgroundColor: LF_LIGHT_GREEN }}>
      {/* Header */}
      <header className="border-b px-6 py-5 shadow-sm" style={{ backgroundColor: LF_GREEN, borderColor: LF_DARK_GREEN }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/20">
              <Droplet className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">Lead Service Line Inventory</h1>
              <p className="text-base" style={{ color: LF_MUTED_GREEN }}>City of Lake Forest Water Utility</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* OAuth Login Button (if needed for private layers) */}
            {!isAuthenticated && (
              <button
                onClick={login}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                Sign In
              </button>
            )}
            {isAuthenticated && (
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                Sign Out
              </button>
            )}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-5 py-2.5 rounded-lg text-base font-medium transition-all flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <Info className="w-5 h-5" />
              How to Use This Map
            </button>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-red-800 text-sm">
              <strong>Error:</strong> {error}
            </p>
            <button
              onClick={refetch}
              className="text-red-700 hover:text-red-900 font-medium text-sm underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-stone-200 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-stone-800">Understanding Your Water Service</h2>
              <button
                onClick={() => setShowInfo(false)}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-stone-500" />
              </button>
            </div>
            <div className="px-8 py-6 space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
                  <Home className="w-6 h-6" style={{ color: LF_GREEN }} />
                  Customer Service Line
                </h3>
                <p className="text-base text-stone-600 leading-relaxed">
                  This is the pipe that runs from your home's plumbing to the property line.
                  <strong className="font-semibold"> You, as the property owner, are responsible for this section.</strong> If
                  this line is made of lead, you may want to consider replacement. The City can provide
                  information about replacement options and contractors.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
                  <Droplet className="w-6 h-6" style={{ color: LF_GREEN }} />
                  Supplier Service Line (City-Owned)
                </h3>
                <p className="text-base text-stone-600 leading-relaxed">
                  This is the pipe that connects from the property line to the water main in the street.
                  <strong className="font-semibold"> The City of Lake Forest owns and maintains this section.</strong> If
                  this line contains lead, the City will work to replace it as part of our infrastructure
                  improvement program.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
                  <MapPin className="w-6 h-6" style={{ color: LF_GREEN }} />
                  Water Main
                </h3>
                <p className="text-base text-stone-600 leading-relaxed">
                  The water main is the large pipe in the street that delivers water to your neighborhood.
                  Modern water mains are not made of lead. The City maintains all water mains.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
                  <Box className="w-6 h-6" style={{ color: LF_GREEN }} />
                  Buffalo Box (B-Box)
                </h3>
                <p className="text-base text-stone-600 leading-relaxed">
                  The buffalo box, or "b-box," is the shut-off valve typically located near the curb or
                  property line. It marks the connection point between the customer service line and the
                  City's supplier service line. This is where responsibility transitions between property
                  owner and City.
                </p>
              </div>

              <div className="rounded-xl p-6" style={{ backgroundColor: LF_LIGHT_GREEN }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: LF_GREEN }}>
                  Questions About Your Service Line?
                </h3>
                <p className="text-base text-stone-700 leading-relaxed">
                  Contact Lake Forest Public Works at <strong>(847) 810-3555</strong> or visit City Hall
                  at 220 E. Deerpath. Our staff can help you understand your service line materials and
                  discuss replacement options if needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1800px] mx-auto w-full">
        {/* Map Area */}
        <div className="flex-1 relative" style={{ backgroundColor: LF_MUTED_GREEN }}>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-6" style={{ borderColor: LF_GREEN, borderTopColor: 'transparent' }}></div>
                <p className="text-xl" style={{ color: LF_GREEN }}>Loading map data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Integrated MapView Component */}
              <MapView
                locations={filteredLocations}
                selectedLocation={selected}
                onLocationSelect={setSelected}
              />

              {/* Search Bar */}
              <div className="absolute top-6 left-6 right-6 lg:right-auto lg:w-[500px]">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Enter your street address..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 text-lg bg-white/95 backdrop-blur border-2 rounded-xl shadow-lg focus:outline-none transition-all"
                    style={{
                      borderColor: LF_MUTED_GREEN,
                      color: LF_DARK_GREEN
                    }}
                    onFocus={(e) => e.target.style.borderColor = LF_GREEN}
                    onBlur={(e) => e.target.style.borderColor = LF_MUTED_GREEN}
                  />
                  {searchLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: LF_GREEN, borderTopColor: 'transparent' }}></div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Side Panel - keeping the same structure as original */}
        <div className="w-full lg:w-[450px] bg-white/95 backdrop-blur border-l flex flex-col overflow-hidden" style={{ borderColor: LF_MEDIUM_GREEN }}>
          {/* Filter Section */}
          <div className="border-b p-6" style={{ borderColor: LF_MUTED_GREEN }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: LF_GREEN }}>Filter Locations</h3>
            <div className="space-y-3">
              <button
                className="w-full px-5 py-3.5 rounded-xl text-base font-medium transition-all border-2"
                style={{
                  backgroundColor: filterMaterial === "all" ? LF_GREEN : 'white',
                  color: filterMaterial === "all" ? 'white' : LF_DARK_GREEN,
                  borderColor: filterMaterial === "all" ? LF_GREEN : LF_MUTED_GREEN
                }}
                onClick={() => setFilterMaterial("all")}
              >
                Show All Locations
              </button>

              <button
                className="w-full px-5 py-3.5 rounded-xl text-base font-medium transition-all border-2"
                style={{
                  backgroundColor: filterMaterial === "lead" ? '#d97706' : 'white',
                  color: filterMaterial === "lead" ? 'white' : LF_DARK_GREEN,
                  borderColor: filterMaterial === "lead" ? '#d97706' : LF_MUTED_GREEN
                }}
                onClick={() => setFilterMaterial("lead")}
              >
                Show Only Lead Service Lines
              </button>

              <button
                className="w-full px-5 py-3.5 rounded-xl text-base font-medium transition-all border-2"
                style={{
                  backgroundColor: filterMaterial === "unknown" ? '#475569' : 'white',
                  color: filterMaterial === "unknown" ? 'white' : LF_DARK_GREEN,
                  borderColor: filterMaterial === "unknown" ? '#475569' : LF_MUTED_GREEN
                }}
                onClick={() => setFilterMaterial("unknown")}
              >
                Show Undetermined Materials
              </button>
            </div>

            <div className="mt-6 pt-6 border-t" style={{ borderColor: LF_MUTED_GREEN }}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold" style={{ color: LF_GREEN }}>{stats.total}</div>
                  <div className="text-sm mt-1" style={{ color: LF_MEDIUM_GREEN }}>Total</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-600">{stats.lead}</div>
                  <div className="text-sm mt-1" style={{ color: LF_MEDIUM_GREEN }}>Lead</div>
                </div>
                <div>
                  <div className="text-3xl font-bold" style={{ color: LF_MEDIUM_GREEN }}>{stats.unknown}</div>
                  <div className="text-sm mt-1" style={{ color: LF_MEDIUM_GREEN }}>Unknown</div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section - same as original */}
          <div className="flex-1 overflow-y-auto p-6">
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: LF_LIGHT_GREEN }}>
                  <Home className="w-12 h-12" style={{ color: LF_GREEN }} />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: LF_GREEN }}>Select a Location</h3>
                <p className="text-base leading-relaxed mb-6" style={{ color: LF_DARK_GREEN }}>
                  Click on a location marker or use the search bar above to view service line information
                  for a specific address.
                </p>
                <p className="text-sm" style={{ color: LF_MEDIUM_GREEN }}>
                  Showing {filteredLocations.length} of {stats.total} locations
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Address Header */}
                <div className="rounded-2xl p-6 border-2" style={{ backgroundColor: LF_LIGHT_GREEN, borderColor: LF_GREEN }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: LF_MEDIUM_GREEN }}>
                        Property Address
                      </div>
                      <h3 className="text-xl font-bold" style={{ color: LF_DARK_GREEN }}>
                        {selected.address}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" style={{ color: LF_MEDIUM_GREEN }} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-base" style={{ color: LF_DARK_GREEN }}>
                    <span>Built in {selected.buildYear}</span>
                    <span>•</span>
                    <span className="font-medium">{selected.status}</span>
                  </div>
                </div>

                {/* Material Cards */}
                <div className="space-y-4">
                  <div className="bg-white border-2 rounded-xl p-5" style={{ borderColor: LF_MUTED_GREEN }}>
                    <div className="flex items-start gap-3 mb-3">
                      <Home className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: LF_MEDIUM_GREEN }} />
                      <div className="flex-1">
                        <h4 className="text-base font-semibold mb-1" style={{ color: LF_GREEN }}>
                          Customer Service Line
                        </h4>
                        <p className="text-sm mb-3" style={{ color: LF_MEDIUM_GREEN }}>
                          Your responsibility (property to home)
                        </p>
                        <div className={`text-lg font-bold px-4 py-2.5 rounded-lg inline-block border-2 ${getMaterialColor(selected.customerMaterial)}`}>
                          {MATERIAL_LABEL(selected.customerMaterial)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 rounded-xl p-5" style={{ borderColor: LF_MUTED_GREEN }}>
                    <div className="flex items-start gap-3 mb-3">
                      <Droplet className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: LF_MEDIUM_GREEN }} />
                      <div className="flex-1">
                        <h4 className="text-base font-semibold mb-1" style={{ color: LF_GREEN }}>
                          Supplier Service Line
                        </h4>
                        <p className="text-sm mb-3" style={{ color: LF_MEDIUM_GREEN }}>
                          City-owned (main to property line)
                        </p>
                        <div className={`text-lg font-bold px-4 py-2.5 rounded-lg inline-block border-2 ${getMaterialColor(selected.supplierMaterial)}`}>
                          {MATERIAL_LABEL(selected.supplierMaterial)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Banner */}
                {(String(selected.customerMaterial).toLowerCase() === "lead" ||
                  String(selected.supplierMaterial).toLowerCase() === "lead") && (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
                    <div className="flex gap-3">
                      <Info className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-900 mb-2 text-base">
                          Lead Service Line Detected
                        </h4>
                        <p className="text-base text-amber-800 leading-relaxed mb-3">
                          This property has a lead service line. While Lake Forest's water is treated
                          to minimize lead exposure, you may want to consider line replacement.
                        </p>
                        <p className="text-sm text-amber-700">
                          Contact Public Works at <strong>(847) 810-3555</strong> for more information
                          about replacement programs and options.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notification Status */}
                {selected.letterSent && (
                  <div className="border-2 rounded-xl p-5" style={{ backgroundColor: LF_LIGHT_GREEN, borderColor: LF_MUTED_GREEN }}>
                    <p className="text-base" style={{ color: LF_DARK_GREEN }}>
                      <strong className="font-semibold">Notice on file:</strong> The property owner
                      has been notified about the service line materials at this address.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t px-6 py-4" style={{ backgroundColor: LF_GREEN, borderColor: LF_DARK_GREEN }}>
        <div className="max-w-7xl mx-auto text-center text-sm" style={{ color: LF_MUTED_GREEN }}>
          City of Lake Forest Public Works • (847) 810-3555 • 220 E. Deerpath, Lake Forest, IL 60045
        </div>
      </footer>
    </div>
  );
}
