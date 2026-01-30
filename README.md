# IFAST

Local network diagnostics and speed test for quick troubleshooting.

## Run from source
Requires Node.js 18+.

```
npm install
npm start
```

Open: http://localhost:3000

## Run as a desktop app (Electron)
```
npm install
npm run desktop
```

## Build a Windows desktop app (portable .exe)
```
npm install
npm run desktop:dist
```

Output file (portable): `dist/IFAST Desktop.exe`

## Build .exe for Windows (to share)
1) Install Node.js 18+ (Windows x64).
2) In the project root:

```
npm install
npm run build:win
```

Output file: `dist/ifast.exe`

## How to run it (Windows)
- They get `ifast.exe`
- Double-click to start
- Open `http://localhost:3000` in a browser

## PWA (GitHub Pages)
This is a pure PWA build that runs without Node on the client. It must be hosted
over HTTPS (GitHub Pages works).

1) Copy the static files to `docs/`:
```
mkdir -p docs
cp -R public/. docs/
touch docs/.nojekyll
```

2) Push to GitHub, then enable Pages:
- Repo Settings → Pages → Source: `main` branch, folder `/docs`

Your app will be at: `https://<user>.github.io/<repo>/`

## Notes
- Speed test traffic goes to Cloudflare's public edge endpoints.
- Diagnostics and OS command output are collected locally by the host machine.
- Internet access is required for public IP, latency, and speed tests.
