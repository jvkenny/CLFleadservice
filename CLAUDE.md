# Lead Service Line Inventory - ArcGIS Integration

## Project Overview

This React application provides a public-facing portal for residents to view the City of Lake Forest's lead service line inventory. The application integrates with ArcGIS Online Feature Services to display service line locations, materials, and status information in an accessible, user-friendly interface.

## Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Mapping**: ArcGIS Maps SDK for JavaScript (v4.x)
- **Authentication**: OAuth 2.0 with PKCE for private feature layers
- **Icons**: Lucide React

### Key Features

1. **Interactive Map Display**
   - ArcGIS Online Feature Service integration
   - Custom symbology for lead vs. non-lead service lines
   - Cluster rendering for performance with large datasets
   - Mobile-responsive map controls

2. **Address Search**
   - ArcGIS World Geocoding Service integration
   - Autocomplete suggestions
   - Zoom to selected address
   - Highlight nearest service line point

3. **Custom Side Panel**
   - Click-based point selection (no default popups)
   - Material display: Customer service line (property owner responsibility)
   - Material display: Supplier service line (City responsibility)
   - Property metadata: Year built, verification status
   - Notification status: Letter sent indicator
   - Lead warning banner when present

4. **Filter System**
   - Show all locations
   - Lead service lines only
   - Undetermined materials only
   - Toggle customer/supplier visibility (future)
   - Status filters: Verified, Assumed, Unknown

5. **Authentication**
   - OAuth 2.0 with PKCE flow for secure access to private layers
   - Token management and refresh
   - Public vs. authenticated layer switching

## Project Structure

```
leadservicelines/
├── src/
│   ├── components/
│   │   ├── Dashboards.tsx          # Main UI component
│   │   ├── MapView.tsx              # ArcGIS map integration
│   │   ├── SearchBar.tsx            # Address geocoding search
│   │   ├── FilterPanel.tsx          # Layer filter controls
│   │   └── InfoPanel.tsx            # Educational modal
│   ├── services/
│   │   ├── arcgis/
│   │   │   ├── auth.ts              # OAuth PKCE authentication
│   │   │   ├── featureService.ts    # Feature layer queries
│   │   │   ├── geocoding.ts         # Address search
│   │   │   └── mapConfig.ts         # Map initialization
│   │   └── types.ts                 # TypeScript interfaces
│   ├── config/
│   │   └── arcgis.config.ts         # ArcGIS credentials & endpoints
│   ├── hooks/
│   │   ├── useArcGISAuth.ts         # Authentication hook
│   │   ├── useFeatureLayer.ts       # Feature data hook
│   │   └── useGeocoder.ts           # Search hook
│   └── App.tsx
├── .env.local                       # Environment variables (gitignored)
├── CLAUDE.md                        # This file
└── README.md                        # Public documentation
```

## Data Model

### Feature Service Schema
Expected attributes from ArcGIS Online Feature Service:

```typescript
interface ServiceLineFeature {
  OBJECTID: number;
  Address: string;
  CustomerMaterial: string;    // Lead, Copper, Unknown, etc.
  SupplierMaterial: string;    // Lead, Copper, Unknown, etc.
  YearBuilt: number;
  Status: string;              // VERIFIED, ASSUMED, UNKNOWN
  LetterSent: boolean;
  LastUpdated: Date;
  geometry: {
    x: number;                 // Longitude
    y: number;                 // Latitude
  };
}
```

### Material Types
- **Lead** (Pb, L): Red/amber warning styling
- **Copper** (Cu): Green/safe styling
- **Galvanized Steel** (Galv): Gray/neutral styling
- **Unknown** (Unk, U, null): Gray with "Not determined" label

## ArcGIS Configuration

### Required ArcGIS Online Resources

1. **Feature Service** (Point Layer)
   - URL: `https://services.arcgis.com/{orgId}/arcgis/rest/services/{serviceName}/FeatureServer/0`
   - Geometry Type: Point (esriGeometryPoint)
   - Spatial Reference: WGS84 (WKID 4326) or Web Mercator (WKID 102100)
   - Capabilities: Query, Data
   - Sharing: Public OR Private with OAuth app

2. **OAuth Application** (for private layers)
   - Type: Application
   - Redirect URIs: `http://localhost:5173`, `https://yourdomain.com`
   - Grant Type: Authorization Code with PKCE
   - Required Privileges: Query, Read from feature service

3. **Web Map** (Optional)
   - Basemap: Light gray canvas or Streets
   - Operational Layers: Lead service line feature layer
   - Symbology: Graduated colors by material type

### Environment Variables

Create `.env.local`:

```bash
# ArcGIS Online Configuration
VITE_ARCGIS_FEATURE_SERVICE_URL=https://services.arcgis.com/...
VITE_ARCGIS_CLIENT_ID=your_oauth_client_id
VITE_ARCGIS_PORTAL_URL=https://www.arcgis.com
VITE_ARCGIS_REDIRECT_URI=http://localhost:5173

# Geocoding Service (uses ArcGIS World Geocoding by default)
VITE_ARCGIS_GEOCODE_SERVICE_URL=https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer

# Feature Layer Settings
VITE_ARCGIS_LAYER_ID=0
VITE_ARCGIS_MAX_FEATURES=10000
```

## Implementation Steps

### Phase 1: Setup & Configuration ✓
- [x] Install dependencies
- [x] Configure Tailwind CSS
- [x] Create base Dashboard UI
- [ ] Set up environment variables
- [ ] Create config files

### Phase 2: ArcGIS Integration
- [ ] Install `@arcgis/core` package
- [ ] Configure OAuth authentication with PKCE
- [ ] Initialize Map and MapView
- [ ] Load Feature Service layer
- [ ] Implement custom symbology renderer

### Phase 3: Data & Interaction
- [ ] Query features from Feature Service
- [ ] Implement address geocoding search
- [ ] Handle point click events
- [ ] Display feature attributes in side panel
- [ ] Sync map state with React state

### Phase 4: Filtering & Performance
- [ ] Build filter query logic
- [ ] Implement client-side and server-side filtering
- [ ] Add feature clustering for performance
- [ ] Optimize re-renders with useMemo/useCallback

### Phase 5: Polish & Deploy
- [ ] Mobile responsiveness testing
- [ ] Accessibility improvements (ARIA labels, keyboard nav)
- [ ] Error handling and loading states
- [ ] Production build optimization
- [ ] Deploy to hosting (Vercel, Netlify, etc.)

## Code Integration Points

### Current Dashboard Component
The existing `Dashboards.tsx` component has:
- ✓ UI layout with header, map area, side panel, footer
- ✓ Municipal green theming
- ✓ Filter buttons and stats display
- ✓ Search input placeholder
- ✓ Mock data structure matching expected schema
- ✓ Material color coding and labels
- ✓ Info modal with educational content

### Needed Integrations
1. Replace mock `MOCK_LOCATIONS` with ArcGIS feature query results
2. Replace map placeholder with `<MapView />` component
3. Connect search input to geocoding service
4. Wire filter buttons to feature layer definition expressions
5. Update stats to calculate from actual feature data
6. Handle authentication flow for private layers

## API Reference

### Key ArcGIS SDK Modules

```typescript
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import Graphic from "@arcgis/core/Graphic";
import esriConfig from "@arcgis/core/config";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import * as locator from "@arcgis/core/rest/locator";
```

### Common Operations

**Query features:**
```typescript
const query = featureLayer.createQuery();
query.where = "CustomerMaterial = 'Lead' OR SupplierMaterial = 'Lead'";
query.outFields = ["*"];
query.returnGeometry = true;
const results = await featureLayer.queryFeatures(query);
```

**Geocode address:**
```typescript
const params = {
  address: { SingleLine: searchTerm },
  location: mapView.center,
  outFields: ["*"]
};
const results = await locator.addressToLocations(geocodeUrl, params);
```

**Handle feature click:**
```typescript
mapView.on("click", async (event) => {
  const response = await mapView.hitTest(event);
  const graphic = response.results[0]?.graphic;
  if (graphic?.layer === featureLayer) {
    setSelected(graphic.attributes);
  }
});
```

## Development Workflow

### Running Locally
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
npm run preview
```

### Testing ArcGIS Integration
1. Set up test Feature Service with sample data
2. Configure OAuth app in ArcGIS Online
3. Update `.env.local` with credentials
4. Test authentication flow
5. Verify feature queries and display
6. Test on mobile devices

## Security Considerations

- OAuth tokens stored in memory only (not localStorage)
- PKCE flow prevents authorization code interception
- Feature Service should have appropriate sharing settings
- Rate limiting on geocoding requests
- Input validation on search queries
- Content Security Policy (CSP) headers for production

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader announcements for map interactions
- High contrast mode support
- Focus indicators
- Alt text for icons and graphics

## Performance Optimization

- Feature layer clustering for large datasets
- Debounced search input
- Lazy loading of map tiles
- React.memo for expensive components
- Virtual scrolling for large result lists
- Service Worker for offline basemap caching

## Future Enhancements

- Export data to PDF or CSV
- Print-friendly map layouts
- Email notification when service line data changes
- Historical data comparison
- Integration with work order management system
- Multi-language support (English/Spanish)
- Public API for third-party integrations

## Support & Resources

- [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/latest/)
- [ArcGIS REST API](https://developers.arcgis.com/rest/)
- [OAuth 2.0 PKCE Flow](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/oauth-2.0/)
- [React Integration Guide](https://developers.arcgis.com/javascript/latest/react/)

## Contact

For technical questions about this implementation:
- ArcGIS Developer Support: https://support.esri.com
- City of Lake Forest Public Works: (847) 810-3555
