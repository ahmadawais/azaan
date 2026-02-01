<img src="https://raw.githubusercontent.com/ahmadawais/azaan/main/.github/azaan.jpeg" alt="azaan" />

# azaan

> Islamic prayer times CLI with automatic location detection

[![npm](https://img.shields.io/npm/v/azaan?style=for-the-badge)](https://www.npmjs.com/package/azaan)

## Automatic Everything

Just run `azaan` — it handles the rest:

- **Auto-detects your location** via IP (3 fallback providers)
- **Auto-recommends calculation method** based on your country
- **Auto-detects timezone** for accurate prayer times
- **Auto-highlights** current and next prayer with countdown

No configuration needed. Just run and pray.

## Install

```bash
npx azaan

# Or install globally and update manually
npm install -g azaan
# Then run:
azaan
# To update later:
npm install -g azaan@latest
```

## Usage

```bash
# Show today's prayer times (auto-setup on first run)
azaan

# Show next prayer with countdown
azaan next

# Show Qibla direction
azaan qibla

# Show monthly calendar
azaan month

# JSON output for scripting
azaan --json

# Single line for status bars (tmux, polybar, waybar)
azaan --status

# List calculation methods
azaan methods

# Configure settings
azaan config
```

## Output

```
  AZAAN - Prayer Times CLI

  📍 San Francisco, USA
  🕐 America/Los_Angeles
  📅 01 Feb 2026
  🌙 13 Shaʿbān 1447 AH

  🌅  Fajr       5:59 AM
  ☀️  Sunrise    7:14 AM
  🌞  Dhuhr      12:23 PM
  🌤️  Asr        3:12 PM ← current
  🌇  Maghrib    5:34 PM ← next in 24m
  🌙  Isha       6:48 PM
```

## Commands

| Command | Description |
|---------|-------------|
| `azaan` | Today's prayer times |
| `azaan next` | Next prayer with countdown |
| `azaan qibla` | Qibla direction from your location |
| `azaan month` | Monthly prayer calendar |
| `azaan methods` | List calculation methods |
| `azaan config` | Configure settings |
| `azaan --reset` | Reset all settings |

## Options

```
-v, --version     Show version
-h, --help        Show help
-c, --city        Override city
-C, --country     Override country
--lat             Override latitude
--lon             Override longitude
-p, --plain       Plain text (no colors/emojis)
-j, --json        JSON output
-s, --status      Single line status
--reset           Reset settings
```

## JSON Output

```bash
azaan --json
```

```json
{
  "location": {
    "city": "San Francisco",
    "country": "USA",
    "timezone": "America/Los_Angeles"
  },
  "date": {
    "gregorian": "01 Feb 2026",
    "hijri": "13 Shaʿbān 1447"
  },
  "timings": {
    "fajr": "05:59",
    "sunrise": "07:14",
    "dhuhr": "12:23",
    "asr": "15:12",
    "maghrib": "17:34",
    "isha": "18:48"
  },
  "current": "asr",
  "next": {
    "prayer": "maghrib",
    "time": "17:34",
    "remaining": "24m"
  }
}
```

## Status Bar

```bash
azaan --status
# Maghrib 5:34 PM (24m)
```

Use in tmux, polybar, waybar, or any status bar.

## Qibla Direction

```bash
azaan qibla
```

```
  🕋  Qibla Direction

  ➡️  118.42° (ESE)

  From: 37.7749, -122.4194
  Direction is degrees clockwise from North
```

## Configuration

```bash
# Interactive setup
azaan config

# Set location
azaan config --city "Makkah" --country "Saudi Arabia"

# Set calculation method
azaan config --method 4

# Set school (0=Shafi, 1=Hanafi)
azaan config --school 1

# Use 24-hour format
azaan config --24h

# Show current config
azaan config --show

# Clear config
azaan config --clear
```

## Calculation Methods

| ID | Method | Region |
|----|--------|--------|
| 0 | Jafari | Shia |
| 1 | Karachi | Pakistan |
| 2 | ISNA | North America |
| 3 | MWL | Europe |
| 4 | Makkah | Saudi Arabia |
| 5 | Egypt | Egypt |
| 7 | Tehran | Iran |
| 15 | Moonsighting | Worldwide |
| 16 | Dubai | UAE |

Run `azaan methods` for full list of 23 methods.

## Features

**Zero-config:**
- Auto-detects location via IP (3 fallback providers)
- Auto-recommends calculation method for your country
- Auto-detects timezone

**Smart display:**
- Highlights current prayer
- Shows next prayer with countdown
- Displays Hijri date

**Flexible output:**
- JSON output for scripting (`--json`)
- Status bar mode for tmux/polybar (`--status`)
- Plain text mode (`--plain`)

**Comprehensive:**
- 23 calculation methods worldwide
- Qibla direction from your location
- Monthly prayer calendar
- Interactive setup wizard

## Aliases

After installing globally, all these aliases work:
- `azaan`
- `athan`
- `azan`

## API

Powered by [Aladhan Prayer Times API](https://aladhan.com/prayer-times-api)

## Author

Ahmad Awais (https://x.com/MrAhmadAwais)

## License

MIT
