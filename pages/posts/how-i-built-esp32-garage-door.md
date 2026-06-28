---
title: How I Built an ESP32-C6 WiFi Garage Door Opener
date: 2026/06/27
description: Building a WiFi-controlled garage door opener with an ESP32-C6 relay board, a momentary pulse relay, embedded web UI, and OTA updates.
tag: dev, esp32, iot, platformio, home automation
author: Felix Berinde
---

# How I Built an ESP32-C6 WiFi Garage Door Opener

I wanted to open my garage door from my phone without paying for a cloud-connected smart opener or wiring up a full HomeKit stack. The wall button already does everything I need — it just sends a short electrical pulse to the opener. All I really needed was something that could press that button over WiFi.

That turned into **[ESP32-6C-Garage-Door-Relay](https://github.com/RecursiveFun/ESP32-6C-Garage-Door-Relay)** — firmware for the **ESP32-C6 Relay X1** board that drives the onboard relay with a 500 ms momentary pulse, exactly like tapping the wall button. It serves a mobile-friendly web UI, exposes a small REST API, and supports over-the-air updates after the first flash.

This post walks through the hardware, why I made certain safety choices, and how the firmware fits together.

## The Problem I Wanted to Solve

Commercial smart garage openers work, but most of them route control through a vendor cloud. I wanted something simpler:

- **Local control only** — open the door from a browser on my home network
- **No extra hardware** beyond a small relay board
- **Same behavior as the wall button** — a momentary contact, not a latched switch
- **Physical button still works** — the board's boot button triggers the same pulse
- **Safe by default** — if power drops or WiFi fails, the opener should not get stuck "pressed"

The ESP32-C6 Relay X1 checked all the boxes: WiFi 6, a built-in 5V relay, and a compact form factor I could tuck near the opener.

## Hardware

| Component | Details |
|-----------|---------|
| Board | ESP32-C6 Relay X1 (B version) |
| MCU | ESP32-C6 — RISC-V dual-core, WiFi 6, BLE 5.3 |
| Relay | 1× 5V relay — AC 250V / DC 30V max |
| Power | DC 7–60V **or** USB-C 5V (use one supply only) |
| Programming | 5-pin UART header (recommended) or Type-C USB |

### Wiring the opener

The relay **COM** and **NO** (normally open) terminals connect in parallel with the wall button:

```
Wall button ──┬── Opener "button" terminals
              │
Relay COM/NO ─┘
```

At idle the relay is **de-energized** and NO stays open. When triggered, the firmware energizes the coil for **500 ms**, closing NO briefly. On **power loss** the relay drops out automatically — the opener is never left in a triggered state.

Most openers expect 200–1000 ms; 500 ms has worked reliably for mine.

### GPIO mapping (B version)

| Function | GPIO | Notes |
|----------|------|-------|
| Relay | **19** | Active HIGH — momentary pulse |
| Status LED | **8** | Active LOW |
| User button | **9** | Boot button; active LOW |
| Door sensor (optional) | **-1** | Set in `config.h` (e.g. GPIO3) |

All pin definitions live in `include/config.h` so the firmware logic in `main.cpp` stays board-agnostic.

### First flash — UART, not USB

The first firmware install **must** go through the board's **5-pin TTL/UART header**. OTA and web upload only work after this initial flash is running.

On my board, Type-C USB was unreliable on Windows, and there was no CP2102 or CH340 on board for USB flashing. I used a USB-TTL adapter:

```
Adapter RX  ←  board TX  (GPIO16)
Adapter TX  →  board RX  (GPIO17)
Adapter GND →  board GND
```

To enter download mode: hold **BOOT** (GPIO **9**) while connecting power or pressing reset, then release after upload starts.

After that first UART flash and WiFi setup, every later update can go over WiFi.

## Tech Stack

| Layer | Technology |
|-------|------------|
| MCU / framework | ESP32-C6, Arduino (ESP-IDF 5.1+ / core 3.x) |
| Build tool | PlatformIO with [pioarduino platform](https://github.com/pioarduino/platform-espressif32) |
| WiFi setup | WiFiManager captive portal |
| Web server | ESP `WebServer` with embedded HTML in PROGMEM |
| Discovery | mDNS (`http://garage-door.local`) |
| OTA | ArduinoOTA + browser upload at `/update` |
| JSON API | ArduinoJson |

**Important:** ESP32-C6 requires **ESP-IDF 5.1+**. The stock PlatformIO `espressif32` platform ships Arduino 2.x and fails with *"C6 requires ESP-IDF of 5.1.0 or newer"*. This project uses the pioarduino community platform instead — already configured in `platformio.ini`.

## Architecture Overview

The data flow is straightforward:

```
Phone / browser ──HTTP──▶ ESP32 WebServer ──GPIO──▶ Relay ──momentary pulse──▶ Garage opener
Physical button ───────────────────────────────────────────────▲
Optional reed switch ──GPIO──▶ Door state (open / closed / unknown)
```

Three paths can trigger the relay:

1. **Web UI** at `/` — tap "Open / Close"
2. **REST API** — `POST /api/trigger`
3. **Physical button** on GPIO 9 — same pulse, debounced at 50 ms

All routes require **HTTP Basic Auth**. The web UI polls `/api/status` every two seconds for door state, WiFi info, cooldown status, and relay enable/disable.

## Relay Safety Model

Garage door openers are not toys, so the firmware treats relay control conservatively:

- **Idle state is always OFF** — the coil is de-energized whether output is enabled or disabled
- **Non-blocking pulse** — `triggerGarageDoor()` sets a flag and energizes the coil; `updateRelayPulse()` in `loop()` ends the pulse after `PULSE_MS` without blocking
- **3-second cooldown** — prevents hammering the motor if someone taps the button repeatedly
- **OTA lockout** — relay triggers are blocked while a firmware update is in progress; the coil is forced OFF
- **Relay enable toggle** — the web UI has a switch to disable relay output entirely (coil stays OFF)

Early in `setup()`, before WiFi init can take several seconds, the code calls `initRelayGpioEarly()` to force the relay OFF immediately:

```cpp
static void initRelayGpioEarly() {
  pinMode(PIN_RELAY, OUTPUT);
  applyRelayOutputState();
}
```

That way a slow WiFi connection never leaves the relay energized by accident.

## The Embedded Web UI

Rather than hosting static files on SPIFFS, the HTML, CSS, and JavaScript are embedded directly in `main.cpp` as PROGMEM strings. That keeps the project to a single source file plus config, and the UI loads instantly from flash.

The interface includes:

- Door status icon (open / closed / unknown)
- **Open / Close** button with busy and cooldown states
- Relay output enable/disable toggle
- Live WiFi, IP, uptime, and firmware version
- Link to `/update` for browser-based OTA

It uses a dark theme, system fonts, and `100dvh` layout so it works well on a phone without a native app.

## WiFi Setup and mDNS

First boot uses **WiFiManager**:

1. The board creates an AP named **`GarageDoor-Setup`**
2. Connect from your phone and enter home WiFi credentials through the captive portal
3. The device joins your network and prints its IP on the serial monitor

Once connected, **mDNS** advertises the device at `http://garage-door.local`. If mDNS does not resolve on your router, use the IP address directly.

## REST API

All endpoints require HTTP Basic Auth (defaults in `config.h` — change before deploying).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Web UI |
| GET | `/api/status` | JSON device state |
| POST | `/api/trigger` | Pulse relay |
| POST | `/api/relay` | Enable/disable relay output |
| GET | `/update` | Firmware upload page |
| POST | `/update` | Upload `.bin` firmware |

Example status response:

```json
{
  "name": "Garage Door",
  "door": "closed",
  "busy": false,
  "cooldown": false,
  "ip": "192.168.1.42",
  "ssid": "MyWiFi",
  "rssi": -62,
  "uptime": 3600,
  "chip": "ESP32-C6",
  "version": "1.1",
  "relay_pin": 19,
  "relay_enabled": true
}
```

## OTA Updates

After the first UART flash, firmware updates go over WiFi two ways:

**PlatformIO (recommended):**

```bash
python -m platformio run -e esp32-c6-devkitc-1-ota -t upload
```

This targets `garage-door.local` with the OTA password from `config.h`.

**Browser upload:**

1. Build: `python -m platformio run`
2. Open `http://garage-door.local/update`
3. Upload `.pio/build/esp32-c6-devkitc-1/firmware.bin`

The partition table uses `min_spiffs` (dual OTA app slots) so a failed update can roll back safely. During any OTA session, relay triggers are blocked and the status LED stays on.

## Optional Door Sensor

If you wire a magnetic reed switch between a GPIO pin and GND, the firmware reports door position as `open` or `closed` in the API and web UI. Set `PIN_DOOR_SENSOR` in `config.h` (e.g. `3`). Without a sensor, the state stays `unknown`.

## Configuration

Everything tunable lives in `include/config.h`:

```cpp
#define PIN_RELAY        19
#define PIN_STATUS_LED    8
#define PIN_BUTTON        9
#define PIN_DOOR_SENSOR  -1

#define PULSE_MS           500
#define COOLDOWN_MS       3000

#define WEB_USERNAME      "admin"
#define WEB_PASSWORD      "your-secure-password"
#define OTA_PASSWORD      "your-ota-password"

#define MDNS_HOSTNAME     "garage-door"
#define DEVICE_NAME       "Garage Door"
#define FIRMWARE_VERSION  "1.1"
```

Re-flash after changing pins or credentials.

## What I Would Improve Next

- **HomeKit or Matter support** for Siri / ecosystem integration without a cloud middleman
- **Hold BOOT 10 s at boot** to reset WiFi credentials without erasing flash
- **HTTPS or token auth** if I ever expose it beyond the LAN
- **Push notifications** when the door opens (would need an external service or Home Assistant hook)

## Running It Yourself

```bash
git clone https://github.com/RecursiveFun/ESP32-6C-Garage-Door-Relay.git
cd ESP32-6C-Garage-Door-Relay
python -m platformio run -t upload --upload-port COM5
python -m platformio device monitor --port COM5
```

Replace `COM5` with your USB-TTL adapter's port. Edit `upload_port` and `monitor_port` in `platformio.ini` to match.

On first boot, connect to **`GarageDoor-Setup`**, enter WiFi credentials, then open `http://garage-door.local` and log in. Change the default password in `config.h` before trusting it with a real garage door.

## Safety Notes

- The relay handles **low-voltage opener control signals** — do not switch mains through this board unless you know exactly what you are doing.
- Use a strong `WEB_PASSWORD` on any network you do not fully trust.
- Keep the cooldown enabled to avoid stressing the opener motor.

## Closing Thoughts

This was a satisfying weekend project — small enough to fit in one `main.cpp`, but with enough edge cases (relay safety, OTA lockout, ESP32-C6 toolchain quirks) to be genuinely interesting. The hardest parts were not the web UI; they were getting the first UART flash working on Windows and making sure the relay could never stick ON during boot or WiFi reconnect.

If you have an ESP32-C6 relay board and a garage opener with standard wall-button terminals, the [source code is on GitHub](https://github.com/RecursiveFun/ESP32-6C-Garage-Door-Relay). Questions or ideas? Reach out on the [Contact](/contact) page.
