# azaan

> Islamic prayer times CLI with automatic location detection

[![npm](https://img.shields.io/npm/v/azaan)](https://www.npmjs.com/package/azaan)

## Install

```bash
npm install -g azaan
```

## Usage

```bash
# Show today's prayer times (auto-setup on first run)
azaan

# Show next prayer with countdown
azaan next

# Show monthly calendar
azaan month

# Configure settings interactively
azaan config

# List all calculation methods
azaan methods

# Reset all settings
azaan --reset
```

## Output

```
  AZAAN - Prayer Times CLI

  📍 Lahore, Pakistan
  🕐 Asia/Karachi
  📅 01 Feb 2026
  🌙 13 Shaʿbān 1447 AH

  🌅  Fajr       5:47 AM
  ☀️  Sunrise    6:56 AM
  🌞  Dhuhr      12:16 PM
  🌤️  Asr        3:14 PM ← current
  🌇  Maghrib    5:37 PM ← next in 45m
  🌙  Isha       6:46 PM
```

## Options

```
-v, --version     Show version
-h, --help        Show help
-c, --city        Override city
-C, --country     Override country
--lat             Override latitude
--lon             Override longitude
-p, --plain       Plain text output (no colors/emojis)
--reset           Reset all settings
```

## Config

```bash
# Interactive configuration
azaan config

# Flag-based configuration
azaan config --city "New York" --country "USA"
azaan config --method 2 --school 1
azaan config --24h

# Show current config
azaan config --show

# Show config file path
azaan config --path

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

Run `azaan methods` for full list.

## Schools

| ID | School | Asr Time |
|----|--------|----------|
| 0 | Shafi | Standard |
| 1 | Hanafi | Later |

## Features

- Auto-detects location via IP geolocation
- Interactive setup wizard with clack
- Highlights current and next prayer
- Shows time remaining until next prayer
- Supports 23 calculation methods
- Monthly calendar view
- Plain text mode for scripts
- Stores config persistently

## Aliases

All these work:
- `azaan`
- `athan`
- `azan`

## API

Powered by [Aladhan Prayer Times API](https://aladhan.com/prayer-times-api)

## License

MIT
