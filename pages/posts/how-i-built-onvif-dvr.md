---
title: How I Built ONVIF-DVR — A Self-Hosted Camera System
date: 2026/06/17
description: Building a self-hosted DVR for IP cameras with ONVIF discovery, live HLS streaming, segmented recording, and a React multiview interface.
tag: dev, onvif, react, node.js, ffmpeg
author: Felix Berinde
---

# How I Built ONVIF-DVR — A Self-Hosted Camera System

I wanted a simple way to watch my IP cameras in a browser, record footage locally, and scrub through recordings without paying for a cloud NVR subscription. Commercial options work, but I prefer owning my data and learning how the pieces fit together.

That goal turned into **[ONVIF-DVR](https://github.com/RecursiveFun/ONVIF-DVR)** — a self-hosted DVR and live-view app for RTSP and HTTP cameras. You can add streams manually, discover cameras over ONVIF, watch live HLS in the browser, record rolling MP4 segments, and play them back with a multi-tab workspace.

This post walks through why I built it, how the architecture works, and the problems that took the most debugging.

## The Problem I Wanted to Solve

Most IP cameras speak **RTSP** — great for VLC, awkward for a web browser. Browsers want **HLS** or WebRTC, not raw RTSP URLs. I also wanted:

- **Local recording** with automatic retention (delete footage older than N days)
- **ONVIF discovery** so I did not have to hunt for stream URLs in camera admin panels
- **Multiple cameras** in a multiview grid
- **Playback** with a timeline, scrubbing, and tabs that remember where I left off

I did not need a massive enterprise VMS. I needed something that runs on a home PC, stores files on disk I control, and stays out of the way.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Material UI, hls.js |
| Backend | Node.js, Express (ES modules) |
| Streaming | FFmpeg (HLS live + fragmented MP4 recording) |
| Camera discovery | ONVIF (WS-Discovery + device API via `onvif` npm package) |
| Testing | Vitest, Testing Library, Supertest, Node test runner |

The repo is split into `client/` (React SPA) and `server/` (Express API + FFmpeg orchestration). A root `package.json` runs both with `concurrently` during development.

## Architecture Overview

At a high level, the data flow looks like this:

```
Camera (RTSP/HTTP) → FFmpeg → HLS segments (live/) + MP4 files (recordings/)
                                    ↓
                              Express API proxies /live and /api
                                    ↓
                              React client (hls.js player, timeline, tabs)
```

**`streamManager.js`** is the heart of the backend. It tracks each camera's state (idle, live, recording), spawns FFmpeg child processes, and persists sessions so streams can restart after a server reboot.

**`recordings.js`** lists segments on disk, builds timeline metadata, serves MP4 files with HTTP Range support, and runs hourly retention cleanup.

**`onvifService.js`** handles WS-Discovery probes, direct host probes, and authenticated connections to pull RTSP stream URIs from cameras.

The React client never talks to cameras directly. Everything goes through the API, which keeps credentials masked and validates inputs before FFmpeg sees them.

## ONVIF Discovery — Harder Than It Looks

ONVIF is a standard, but every camera vendor implements it slightly differently. My discovery flow:

1. **WS-Discovery** — send UDP probes to `239.255.255.250:3702` on each local network interface
2. Parse SOAP responses to extract device names, XAddrs, and hostnames
3. Fall back to the legacy `onvif` library probe if nothing responds
4. For stubborn cameras, **Connect by IP** sends unicast probes directly to a hostname

Once a device is found, connecting is another challenge. Cameras use different service paths (`/onvif/device_service`, `/onvif/services`, etc.) and different auth modes (WS-Security vs HTTP digest). My `getStreamUri` function tries multiple path and auth combinations until one works:

```javascript
const paths = [
  path,
  '/onvif/device_service',
  '/onvif/device_service.cgi',
  '/onvif/services',
].filter(Boolean)

for (const p of paths) {
  for (const useWSSecurity of [true, false]) {
    // attempt connection...
  }
}
```

ONVIF credentials are often **separate from RTSP credentials** — a lesson I learned after many "authentication failed" errors. The UI makes that explicit: enter ONVIF username/password first, fetch the stream URI, then add the camera.

Windows Firewall blocking UDP 3702 was another common gotcha. The discovery panel returns hints when the scan finds nothing.

## FFmpeg — Two Pipelines Per Camera

Each camera can run up to two FFmpeg processes:

1. **Live HLS** — transcodes or copies the stream into rolling `.ts` segments and an `index.m3u8` playlist under `data/live/<camera-id>/`
2. **DVR recording** — writes fragmented MP4 files to `data/recordings/<camera-id>/` with filenames like `2026-06-08_14-30-00.mp4`

Video is usually stream-copied (`-c:v copy`) to save CPU. Audio gets transcoded to **AAC** because browsers cannot play G.711 or PCM from most cameras.

HTTP/MJPEG cameras needed extra work. Unlike RTSP, MJPEG streams over HTTP can use different demuxers (`mjpeg`, `mpjpeg`, or auto-detect). I added `httpStreamProbe.js` to sniff the content type on first connect and pick the right FFmpeg input format. HTTP cameras also disconnect periodically — FFmpeg reconnects, and the server restarts the pipeline if a process exits unexpectedly.

Shared argument building lives in `ffmpegArgs.js` so live and recording pipelines stay consistent and testable.

## The React Frontend

The UI is organized around a **multi-tab workspace**:

- **Camera tabs** — live view with recording controls and a zoomable timeline
- **Segment tabs** — playback of a specific recording with scrub position saved in `localStorage`
- **Multiview** — drag cameras into a 2×2 through 6×6 grid

Key components:

- **`LivePlayer.jsx`** — wraps hls.js for low-latency live preview
- **`DVRPlayer.jsx`** — native `<video>` for MP4 playback with speed controls (0.5×–4×)
- **`Timeline.jsx`** — mouse-wheel zoom, shift+wheel pan, day-grouped segment list
- **`MultiviewGrid.jsx`** — grid layout with drag-from-sidebar to fill slots

Tab state, theme preference, multiview selection, and scrub positions all persist in `localStorage` so a page refresh does not lose your place.

Material UI handles the dark/light theme toggle. The sidebar collapses to give the video area maximum space.

## Security by Default

This is a **local-first** app. The API binds to `127.0.0.1` by default — not exposed to the internet unless you explicitly set `HOST=0.0.0.0` for LAN access via `npm run lan`.

Other measures:

- RTSP credentials masked in API responses
- Path traversal checks on recording file access
- SSRF protection blocks cloud metadata hostnames in ONVIF probes
- Rate limiting on API and ONVIF endpoints
- No built-in auth — if you expose it beyond localhost, put it behind nginx/Caddy/Tailscale

## Data on Disk

Runtime data lives under `data/` (gitignored):

```
data/
├── cameras.json       # Camera list and stream URLs
├── sessions.json      # Live/recording state for restore on reboot
├── settings.json      # Segment duration, retention, folder path
├── live/<id>/         # HLS playlists and segments
└── recordings/<id>/   # MP4 DVR files
```

Retention runs hourly — segments older than the configured age (default 7 days) are deleted automatically. Disk space is monitored; recording stops if storage is critically low.

## Testing

The project has **170 automated tests** — 70 server, 100 client. I wanted confidence that FFmpeg argument builders, security helpers, HTTP probe logic, and React components would not regress as features grew.

CI runs `npm test` on every push via GitHub Actions. A local pre-push git hook can block pushes when tests fail.

## What I Would Improve Next

- **WebRTC** for even lower live latency than HLS
- **Motion detection** hooks on recorded segments
- **Mobile-friendly** layout tweaks for phone viewing over LAN
- **Docker image** for one-command deployment
- **User authentication** for LAN deployments without a reverse proxy

## Running It Yourself

```bash
git clone https://github.com/RecursiveFun/ONVIF-DVR.git
cd ONVIF-DVR
npm run install:all
npm run dev
```

Open **http://localhost:5173**. You need **FFmpeg** on your PATH — the health endpoint at `/api/health` reports whether it is available.

For phones or tablets on your home network, use `npm run lan` instead of the Vite dev server. The dev server's hot-reload WebSocket causes flickering over the network.

## Closing Thoughts

ONVIF-DVR was one of the most complex projects I have built solo — it spans network protocols, video codecs, process management, filesystem layout, and a full React UI. The hardest parts were not the React components; they were ONVIF auth quirks, FFmpeg reconnect behavior on cheap MJPEG cameras, and making fragmented MP4 seekable in the browser.

If you have IP cameras and want a self-hosted alternative to cloud NVRs, the [source code is on GitHub](https://github.com/RecursiveFun/ONVIF-DVR). Questions or ideas? Reach out on the [Contact](/contact) page.
