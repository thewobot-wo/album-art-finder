# PLAYART - Album Art Finder

A cross-platform album artwork finder and downloader available as both a web app and native iOS/macOS app.

## Project Structure

This is a monorepo containing three packages:

```
├── web/          # Next.js web application
├── native/       # React Native (Expo) mobile app
└── shared/       # Shared TypeScript code (types, API, utilities)
```

## Features

- **Search album artwork** from iTunes and Deezer APIs
- **High-resolution downloads** (up to 1200x1200 for iTunes)
- **Multiple platforms**: Web, iPhone, iPad, and macOS
- **Dark theme** with yellow accent colors
- **Responsive design** - adapts to screen size (1-4 columns)
- **Helper buttons** for Broadway/Musical search terms
- **Native features** (mobile only):
  - Save to photo library
  - Share functionality
  - Native alerts and prompts
  - Safe area support

## Prerequisites

- Node.js 18+ and npm
- For iOS development: macOS with Xcode installed
- Expo CLI (installed automatically with the project)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd album-art-finder
```

2. Install dependencies:
```bash
npm install
```

This will install dependencies for all three workspaces (web, native, and shared).

## Running the Apps

### Web App (Next.js)

```bash
# Development mode
npm run web:dev

# Production build
npm run web:build
npm run web:start
```

The web app will be available at `http://localhost:3000/playart`

### Native App (React Native/Expo)

```bash
# Start Expo dev server
npm run native:start

# Run on iOS Simulator
npm run native:ios

# Run on Android Emulator
npm run native:android
```

Or from the native directory:
```bash
cd native
npx expo start
```

Then press:
- `i` for iOS Simulator
- `a` for Android Emulator
- `w` for web browser
- Scan QR code with Expo Go app for physical device testing

## Testing on Different Devices

### iPhone
- Run on iOS Simulator or scan QR code with Expo Go app
- Portrait mode with single column grid

### iPad
- Run on iPad Simulator
- Automatically shows 2-3 columns depending on orientation
- Supports both portrait and landscape

### macOS (Catalyst)
**Note:** Full macOS support requires building with EAS or Xcode. Web version works on macOS browsers.

To build for macOS with Expo:
1. Install EAS CLI: `npm install -g eas-cli`
2. Configure EAS: `eas build:configure`
3. Build for macOS: `eas build --platform ios --profile production`

## Development

### Shared Code

The `shared/` package contains code used by both web and native apps:

- **types.ts** - TypeScript interfaces for album data
- **api.ts** - API functions for searching iTunes and Deezer
- **utils.ts** - Helper functions for getting image URLs and album info

To modify shared code, edit files in `shared/src/` and both apps will automatically pick up the changes.

### Adding Dependencies

For shared code:
```bash
cd shared
npm install <package-name>
```

For web app:
```bash
cd web
npm install <package-name>
```

For native app (use Expo's install for React Native packages):
```bash
cd native
npx expo install <package-name>
```

## Building for Production

### Web App

```bash
npm run web:build
```

Deploy the `web/.next` folder to your hosting provider (Vercel, Netlify, etc.)

### Native App

For App Store/TestFlight distribution:

1. Create an Expo account: https://expo.dev
2. Install EAS CLI: `npm install -g eas-cli`
3. Login: `eas login`
4. Configure build: `cd native && eas build:configure`
5. Build for iOS: `eas build --platform ios`
6. Submit to App Store: `eas submit --platform ios`

For Android Play Store:
```bash
eas build --platform android
eas submit --platform android
```

## Permissions

The native app requires the following permissions:

### iOS
- **Photo Library Access** - To save downloaded album artwork to your photo library
- **Network Access** - To search iTunes and Deezer APIs

### Android
- **WRITE_EXTERNAL_STORAGE** - To save images
- **READ_EXTERNAL_STORAGE** - To access saved images

Permissions are automatically requested when the user tries to download an image.

## API Sources

- **iTunes Search API** - High-quality artwork from Apple Music
- **Deezer API** - Alternative artwork source

No API keys required - both APIs are free and public.

## Customization

### Changing Colors

Edit the color codes in:
- Web: `web/app/globals.css` and `web/app/page.tsx`
- Native: `native/App.tsx` (StyleSheet section)

Current theme:
- Background: Black (`#000`)
- Accent: Yellow (`#FCD34D`)
- Cards: Dark gray (`#1a1a1a`)

### Adding Features

1. Add business logic to `shared/src/`
2. Import and use in web app (`web/app/page.tsx`)
3. Import and use in native app (`native/App.tsx`)

## Troubleshooting

### Web app basePath issues
The web app is configured with `basePath: '/playart'`. If deploying to root domain, remove this from `web/next.config.js`.

### Native app won't build
- Run `cd native && npx expo install --check` to verify dependencies
- Clear Expo cache: `npx expo start --clear`
- Delete `node_modules` and reinstall: `npm install`

### Shared code not updating
- Restart the dev server
- If using TypeScript, rebuild: `cd shared && npm run type-check`

### macOS app not working
- Expo Go doesn't support macOS - you need to build with EAS
- Alternatively, use the web version on macOS browsers

## License

Private project

## Credits

Built with:
- Next.js 14
- React Native + Expo SDK 54
- TypeScript
- iTunes Search API
- Deezer API
