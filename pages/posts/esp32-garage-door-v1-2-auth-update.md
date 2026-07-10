---
title: ESP32 Garage Door Opener v1.2 — Bearer Auth, JWT, and Remote Access
date: 2026/07/09
description: A follow-up to my ESP32-C6 garage door opener — replacing HTTP Basic Auth with Bearer tokens and JWT, adding NTP time sync, and exposing a minimal API through a Cloudflare tunnel for an Android client.
tag: dev, esp32, iot, security, home automation
author: Felix Berinde
---

# ESP32 Garage Door Opener v1.2 — Bearer Auth, JWT, and Remote Access

In [How I Built an ESP32-C6 WiFi Garage Door Opener](/posts/how-i-built-esp32-garage-door), I walked through the first version of **[ESP32-6C-Garage-Door-Relay](https://github.com/RecursiveFun/ESP32-6C-Garage-Door-Relay)** — a local-only firmware build with HTTP Basic Auth, an embedded web UI, and OTA updates. That got the door working reliably on my home network, but it was not designed for anything beyond the LAN.

A few days later I shipped **firmware v1.2**, which replaces Basic Auth with **Bearer tokens and JWT**, adds **NTP time sync**, and sets up a **Cloudflare tunnel** so an Android app can trigger the door over cellular without exposing the full web UI or OTA endpoints to the internet.

This post covers what changed, why I made those choices, and how the new auth flow works end to end.

## Why I Revisited Auth

The original design was intentionally simple: username and password on every request, browser popup included. That was fine for opening the garage from my phone while connected to WiFi, but it had limits:

- **Basic Auth in a browser popup** is awkward on mobile and does not map cleanly to a native app
- **The same long-lived credentials** were sent on every API call with no expiry
- **Remote access** was listed as a future improvement — I wanted to open the door from outside the house without putting the entire device on the public internet

The relay safety model (idle OFF, momentary pulse, cooldown, OTA lockout) did not need to change. The work was all in how requests are authenticated and what gets exposed remotely.

## What Changed at a Glance

| Area | v1.1 (original post) | v1.2 (current) |
|------|----------------------|----------------|
| Auth scheme | HTTP Basic Auth (`WEB_USERNAME` / `WEB_PASSWORD`) | `Authorization: Bearer <token>` |
| Web UI login | Browser credential popup | In-page API key form → JWT exchange |
| API credentials | Username + password | `API_KEY` + `JWT_SECRET` in `config.h` |
| Token lifetime | None (static password) | JWT expires after 24 hours (configurable) |
| New endpoint | — | `POST /api/auth/token` |
| Time dependency | None | NTP sync required for JWT |
| New file | — | `include/jwt_auth.h` |
| Remote access | Not implemented | Cloudflare tunnel (status + trigger only) |
| Firmware version | `1.1` | `1.2` |

Everything else — relay wiring, GPIO mapping, WiFiManager setup, mDNS, OTA paths, cooldown logic — stayed the same.

## From Basic Auth to Bearer + JWT

### Configuration

`WEB_USERNAME` and `WEB_PASSWORD` are gone. Security settings in `include/config.h` now look like this:

```cpp
#define API_KEY           "your-secure-api-key"
#define JWT_SECRET        "your-jwt-signing-secret"
#define JWT_EXPIRY_SEC    86400   // 24 hours
#define OTA_PASSWORD      "your-ota-password"
```

- **`API_KEY`** — long-lived secret used by the Android app (and to log into the web UI)
- **`JWT_SECRET`** — HMAC signing key for short-lived tokens issued to the browser
- **`JWT_EXPIRY_SEC`** — how long a web session token remains valid

Change all defaults before deploying. Re-flash after editing `config.h`.

### Two ways to authenticate

Protected routes accept `Authorization: Bearer <token>` where the token is either:

1. **The API key directly** — used by the Android app over the Cloudflare tunnel
2. **A JWT** — obtained by the web UI after exchanging the API key at `POST /api/auth/token`

The check happens in `checkAuth()`:

```cpp
static bool checkAuth() {
  String token;
  if (!extractBearer(token)) {
    return false;
  }
  if (token == String(API_KEY)) {
    return true;
  }
  return jwtVerify(token, JWT_SECRET, time(nullptr));
}
```

This split matters for remote access. The Android client can send the API key straight to `/api/status` and `/api/trigger` without ever hitting the token exchange endpoint. The web UI, on the other hand, trades the API key for a JWT once and stores it in `sessionStorage` for subsequent requests.

### New auth endpoint

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/token` | Bearer API key | Returns a signed JWT |

Example response:

```json
{
  "token": "eyJhbG...",
  "expires_in": 86400
}
```

If NTP has not synced yet, the endpoint returns `503` with `{"error":"Clock not synced"}` — JWTs need a valid clock to set `iat` and `exp` claims.

### Web UI login flow

The embedded HTML no longer relies on a browser auth dialog. On first visit, a login overlay prompts for the API key. JavaScript calls `/api/auth/token`, stores the JWT in `sessionStorage`, and attaches `Authorization: Bearer <jwt>` to every subsequent fetch.

If a request comes back `401`, the UI clears the stored JWT and shows the login overlay again. OTA uploads through `/update` use the same Bearer header.

## Rolling My Own JWT on the ESP32

Rather than pulling in a full JWT library, I added **`include/jwt_auth.h`** — a minimal HS256 implementation using mbedTLS (already available in the ESP-IDF toolchain):

- Base64url encode/decode for header, payload, and signature
- HMAC-SHA256 signing and verification
- Constant-time signature comparison
- Expiry check against the current time

`jwtCreate()` and `jwtVerify()` are the only public functions. The payload is simple:

```json
{"sub":"garage","iat":1719878400,"exp":1719964800}
```

Keeping this in a header file avoided another dependency and kept the firmware footprint small. The trade-off is that it only supports what this project needs — HS256, one subject, expiry — which is exactly the scope here.

## NTP Time Sync

JWTs depend on accurate timestamps. After WiFi connects in `setup()`, the firmware calls `syncNetworkTime()`:

```cpp
configTime(0, 0, "pool.ntp.org", "time.nist.gov");
```

It retries for up to 10 seconds. If sync fails, the device still runs — relay control, physical button, and API-key-only auth all work — but JWT creation and verification are disabled until the clock is set. The serial monitor logs either a successful sync or a warning that JWT auth is unavailable.

This was a new boot-time dependency compared to v1.1, but a reasonable one for token expiry to mean anything.

## Remote Access via Cloudflare Tunnel

Opening the garage from outside the house was the main motivation for the auth rework. I did **not** want to port-forward the ESP32's web server directly. Instead, a Cloudflare tunnel on my LAN exposes only two paths:

```yaml
ingress:
  - hostname: garage.example.com
    path: /api/status
    service: http://<esp32-lan-ip>:80
  - hostname: garage.example.com
    path: /api/trigger
    service: http://<esp32-lan-ip>:80
  - hostname: garage.example.com
    service: http_status:404
  - service: http_status:404
```

Everything else — the web UI at `/`, OTA at `/update`, and the JWT exchange at `/api/auth/token` — returns 404 through the tunnel. The Android app sends `Authorization: Bearer <API_KEY>` directly to the two allowed endpoints.

This gives me remote open/close and status checks without exposing firmware upload or the full control panel to the internet.

## Updated API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | Web UI (API key entered in browser) |
| GET | `/update` | — | Firmware upload page |
| POST | `/api/auth/token` | API key | Issue JWT (LAN only; blocked by tunnel) |
| GET | `/api/status` | API key or JWT | JSON device state |
| POST | `/api/trigger` | API key or JWT | Pulse relay |
| POST | `/api/relay` | API key or JWT | Enable/disable relay output |
| POST | `/update` | API key or JWT | Upload `.bin` firmware |

The status response dropped the `ip` field (WiFi SSID and RSSI are still there). Version now reports `"1.2"`.

## What Did Not Change

Worth calling out so nobody re-reads the whole original post:

- **Relay safety** — idle de-energized, 500 ms non-blocking pulse, 3 s cooldown, OTA lockout
- **Hardware** — ESP32-C6 Relay X1, GPIO 19/8/9, UART-first flash
- **WiFi setup** — WiFiManager captive portal on `GarageDoor-Setup`
- **Discovery** — mDNS at `http://garage-door.local`
- **OTA** — PlatformIO `esp32-c6-devkitc-1-ota` environment and browser upload at `/update`

If you are wiring the board or flashing for the first time, start with the [original write-up](/posts/how-i-built-esp32-garage-door).

## Upgrading from v1.1

1. Update `include/config.h` — remove `WEB_USERNAME` / `WEB_PASSWORD`, add `API_KEY`, `JWT_SECRET`, and `JWT_EXPIRY_SEC`
2. Keep `OTA_PASSWORD` in sync with `upload_flags --auth=` in `platformio.ini`
3. Flash over OTA or UART:

```bash
python -m platformio run -e esp32-c6-devkitc-1-ota -t upload
```

4. Open the web UI, enter your API key in the new login overlay, and confirm `/api/status` responds

If JWT login fails immediately after boot, check the serial monitor for NTP sync status.

## What I Would Improve Next

Some of these were on the v1.1 list; a few are new:

- **HomeKit or Matter** for Siri integration without a custom Android app
- **Hold BOOT 10 s at boot** to reset WiFi credentials without erasing flash
- **Refresh tokens** or shorter JWT lifetimes with silent renewal in the web UI
- **Rate limiting** on `/api/trigger` at the tunnel layer for extra protection
- **Push notifications** when the door opens (Home Assistant hook or similar)

## Closing Thoughts

The garage door firmware was already doing its job locally. v1.2 was about making auth fit two different clients — a browser on the LAN and a phone on cellular — without weakening the safety model or exposing OTA to the internet.

The interesting part was not the relay code; it was fitting JWT auth, NTP, and a split credential model onto a device with limited RAM, no external JWT library, and a hard requirement that the relay never gets stuck ON.

Source code and setup instructions are on GitHub: **[ESP32-6C-Garage-Door-Relay](https://github.com/RecursiveFun/ESP32-6C-Garage-Door-Relay)**. Questions or ideas? Reach out on the [Contact](/contact) page.
