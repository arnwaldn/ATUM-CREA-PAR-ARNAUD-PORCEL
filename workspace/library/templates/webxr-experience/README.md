# WebXR Experience Template

> Immersive VR/AR web experience with A-Frame and Three.js

## Stack

- **A-Frame 1.5** for declarative VR
- **Three.js** for advanced 3D
- **WebXR API** for VR/AR
- **Vite** for build
- **TypeScript** support

## Features

- [x] VR mode with controllers
- [x] Teleportation locomotion
- [x] Object grabbing
- [x] 3D model loading (GLTF/GLB)
- [x] Spatial audio
- [x] Custom components
- [x] Hand tracking ready
- [x] Desktop fallback

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in browser, then click "Enter VR" with a headset connected.

## Structure

```
webxr-experience/
├── public/
│   ├── models/           # 3D models (GLB)
│   ├── textures/         # Images, HDR
│   ├── audio/            # Spatial audio
│   └── draco/            # Draco decoder
├── src/
│   ├── components/       # A-Frame components
│   │   ├── teleport.js
│   │   ├── grabbable.js
│   │   └── ui-panel.js
│   ├── scenes/
│   │   └── main-scene.html
│   ├── styles/
│   │   └── main.css
│   └── main.ts
├── index.html
├── package.json
└── vite.config.ts
```

## Supported Devices

- Meta Quest 2/3/Pro
- Pico 4
- HTC Vive
- Valve Index
- Windows MR
- Desktop (mouse/keyboard)

## Requirements

- Modern browser with WebXR support
- HTTPS for VR mode (localhost OK for dev)
- Node.js 18+

## License

MIT
