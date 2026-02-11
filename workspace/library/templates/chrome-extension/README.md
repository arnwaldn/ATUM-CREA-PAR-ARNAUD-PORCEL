# Chrome Extension Template

A modern Chrome Extension boilerplate with **React 19**, **TypeScript**, **Vite**, and **Manifest V3**.

## Features

- **React 19** - Latest React with hooks
- **TypeScript** - Full type safety
- **Vite** - Lightning fast HMR
- **CRXJS** - Seamless extension development
- **Tailwind CSS** - Utility-first styling
- **Manifest V3** - Latest Chrome extension API

## Structure

```
├── manifest.json          # Extension manifest
├── src/
│   ├── popup/            # Popup React app
│   │   ├── index.html
│   │   ├── index.tsx
│   │   └── Popup.tsx
│   ├── options/          # Options page
│   │   ├── index.html
│   │   ├── index.tsx
│   │   └── Options.tsx
│   ├── background/       # Service worker
│   │   └── background.ts
│   ├── content/          # Content script
│   │   └── content.ts
│   ├── lib/              # Shared utilities
│   │   ├── storage.ts    # Chrome Storage wrapper
│   │   └── messaging.ts  # Message passing
│   └── styles/
│       └── globals.css
├── public/
│   └── icons/           # Extension icons
└── vite.config.ts
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Load Extension in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

## Development

### Hot Reload

The extension supports hot reload during development:
- **Popup**: Changes reload automatically
- **Options**: Changes reload automatically
- **Background**: Requires extension reload
- **Content Scripts**: Requires page refresh

### Adding Permissions

Edit `manifest.json` to add permissions:

```json
{
  "permissions": [
    "storage",
    "activeTab",
    "tabs",
    "notifications"  // Add new permissions
  ]
}
```

### Messaging Between Scripts

```typescript
// From popup to background
import { sendMessage } from './lib/messaging'
const response = await sendMessage({ type: 'GET_TAB_INFO' })

// From background to content script
import { sendToTab } from './lib/messaging'
await sendToTab(tabId, { type: 'HIGHLIGHT', payload: 'search text' })
```

### Using Storage

```typescript
import { storage, syncStorage } from './lib/storage'

// Local storage (per device)
await storage.set('key', { data: 'value' })
const value = await storage.get('key')

// Sync storage (across devices)
await syncStorage.set('settings', { theme: 'dark' })

// Watch for changes
storage.watch('key', (newValue, oldValue) => {
  console.log('Changed:', newValue)
})
```

## Building for Production

```bash
npm run build
```

The built extension will be in the `dist` folder.

### Packaging for Chrome Web Store

1. Build the extension: `npm run build`
2. Zip the `dist` folder
3. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Framework |
| TypeScript | 5.7 | Type Safety |
| Vite | 6.x | Build Tool |
| @crxjs/vite-plugin | 2.x | Extension Dev |
| Tailwind CSS | 3.x | Styling |

## License

MIT
