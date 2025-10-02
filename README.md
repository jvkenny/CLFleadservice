# Lead Service Line Inventory Portal

A modern, accessible web application for viewing lead service line inventory data for the City of Lake Forest, Illinois. Built with React, TypeScript, Vite, and ArcGIS Online integration.

![Lead Service Line Inventory](https://img.shields.io/badge/status-development-yellow)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![ArcGIS](https://img.shields.io/badge/ArcGIS-Maps%20SDK-green)

## Features

- 🗺️ **Interactive Map** - View service line locations on an ArcGIS-powered map
- 🔍 **Address Search** - Find your property with geocoded address search
- 📊 **Custom Detail Panel** - View material types, status, and property information
- 🎯 **Smart Filtering** - Filter by material type (lead, unknown, all)
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 🔐 **OAuth Support** - Secure access to private feature layers with PKCE flow
- ♿ **Accessible** - Built with WCAG guidelines in mind
- 🎨 **Municipal Branding** - Lake Forest green color scheme

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Mapping**: ArcGIS Maps SDK for JavaScript
- **Icons**: Lucide React
- **Authentication**: OAuth 2.0 with PKCE

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- An ArcGIS Online account (for feature services)
- OAuth Client ID (if using private layers)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd leadservicelines
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your ArcGIS credentials:
   ```bash
   VITE_ARCGIS_FEATURE_SERVICE_URL=https://services.arcgis.com/your-org/arcgis/rest/services/YourService/FeatureServer/0
   VITE_ARCGIS_CLIENT_ID=your_oauth_client_id
   VITE_ARCGIS_REDIRECT_URI=http://localhost:5173
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173)

## ArcGIS Setup

### 1. Feature Service Requirements

Your ArcGIS Feature Service should have the following fields:

| Field Name | Type | Description |
|------------|------|-------------|
| `OBJECTID` | Integer | Unique identifier |
| `Address` | String | Property address |
| `CustomerMaterial` | String | Customer service line material (Lead, Copper, etc.) |
| `SupplierMaterial` | String | Supplier service line material |
| `YearBuilt` | Integer | Year property was built |
| `Status` | String | Verification status (VERIFIED, ASSUMED, UNKNOWN) |
| `LetterSent` | Boolean | Whether notification was sent |
| Geometry | Point | Location coordinates |

### 2. OAuth Application Setup (for private layers)

1. Go to [ArcGIS Developers Dashboard](https://developers.arcgis.com/applications)
2. Create a new Application
3. Set **Redirect URIs**:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`
4. Copy the **Client ID** to your `.env.local`

### 3. Sharing Settings

For **public layers**: Set feature service sharing to "Everyone (public)"

For **private layers**: Use OAuth authentication (already implemented)

## Project Structure

```
leadservicelines/
├── src/
│   ├── components/
│   │   ├── Dashboards.tsx              # Main UI (mock data)
│   │   ├── DashboardsIntegrated.tsx    # Production version with ArcGIS
│   │   └── MapView.tsx                 # Map component
│   ├── services/
│   │   ├── arcgis/
│   │   │   ├── auth.ts                 # OAuth authentication
│   │   │   ├── featureService.ts       # Feature queries
│   │   │   └── geocoding.ts            # Address search
│   │   └── types.ts                    # TypeScript types
│   ├── hooks/
│   │   ├── useArcGISAuth.ts            # Auth hook
│   │   ├── useFeatureLayer.ts          # Data fetching hook
│   │   └── useGeocoder.ts              # Search hook
│   ├── config/
│   │   └── arcgis.config.ts            # ArcGIS configuration
│   ├── App.tsx
│   └── main.tsx
├── .env.example                        # Environment template
├── CLAUDE.md                           # Detailed implementation guide
└── README.md                           # This file
```

## Development Workflow

### Using Mock Data (Default)

The application starts with mock data in `Dashboards.tsx`. This allows you to develop and test the UI without setting up ArcGIS.

### Switching to Real Data

1. Install ArcGIS SDK (when ready):
   ```bash
   npm install @arcgis/core
   ```

2. Configure your `.env.local` with real credentials

3. Rename files:
   ```bash
   mv src/components/Dashboards.tsx src/components/DashboardsMock.tsx
   mv src/components/DashboardsIntegrated.tsx src/components/Dashboards.tsx
   ```

4. Restart the dev server

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Configuration

### Map Settings

Edit `src/config/arcgis.config.ts` to customize:

- Default map center and zoom
- Basemap style
- Symbol colors and sizes
- Clustering settings

### Styling

The application uses municipal green colors defined in the Dashboard component:

```typescript
const LF_GREEN = "#2d5f3f";        // Primary green
const LF_LIGHT_GREEN = "#e8f3ed";  // Background
const LF_MEDIUM_GREEN = "#4a7c5d"; // Accents
```

Modify these constants or update Tailwind config for custom branding.

## Deployment

### Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Environment Variables

Set these in your hosting platform:

- `VITE_ARCGIS_FEATURE_SERVICE_URL`
- `VITE_ARCGIS_CLIENT_ID`
- `VITE_ARCGIS_REDIRECT_URI` (use your production URL)

### Recommended Hosts

- **Vercel** - Zero configuration, environment variable support
- **Netlify** - Easy deployment with continuous integration
- **ArcGIS Online** - Host directly on ArcGIS Hub or Experience Builder

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Accessibility

- Keyboard navigation supported
- ARIA labels on interactive elements
- Screen reader compatible
- Focus indicators on all controls
- Semantic HTML structure

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Detailed implementation guide and API reference
- **[ArcGIS Maps SDK Docs](https://developers.arcgis.com/javascript/)** - Official SDK documentation
- **[OAuth PKCE Guide](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/oauth-2.0/)** - Authentication setup

## Troubleshooting

### "Failed to resolve import lucide-react"
```bash
npm install lucide-react
```

### "Tailwind classes not working"
```bash
npm install -D tailwindcss @tailwindcss/postcss
```

### "Feature service query failed"
- Check your `VITE_ARCGIS_FEATURE_SERVICE_URL` in `.env.local`
- Verify the feature service is accessible (public or authenticated)
- Check browser console for CORS errors

### OAuth redirect not working
- Ensure redirect URI in `.env.local` matches your OAuth app settings
- Check that the URI has no trailing slash
- Verify HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

[Your License Here]

## Contact

City of Lake Forest Public Works
Phone: (847) 810-3555
Address: 220 E. Deerpath, Lake Forest, IL 60045

---

**Note**: This application is currently in development. See [CLAUDE.md](CLAUDE.md) for detailed implementation steps and integration guide.
