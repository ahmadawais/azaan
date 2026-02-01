# Azaan CLI Specification

## Overview
Azaan is a command-line interface for Islamic prayer times, powered by the Aladhan API.

## Commands

| Command | Description |
|---------|-------------|
| `azaan` | Show today's prayer times (launches setup if unconfigured) |
| `azaan today` | Show today's prayer times |
| `azaan next` | Show next prayer with countdown |
| `azaan month` | Show monthly prayer calendar |
| `azaan methods` | List all calculation methods |
| `azaan config` | Interactive configuration wizard |
| `azaan reset` | Reset all settings to defaults |

## Global Options

| Flag | Description |
|------|-------------|
| `-v, --version` | Show version |
| `-h, --help` | Show help |
| `-c, --city <city>` | Override city |
| `-C, --country <country>` | Override country |
| `--lat <latitude>` | Override latitude |
| `--lon <longitude>` | Override longitude |
| `-p, --plain` | Plain text output (no colors/emojis) |
| `--reset` | Reset all settings |

## Config Options

| Flag | Description |
|------|-------------|
| `--show` | Show current configuration |
| `--clear` | Clear all configuration |
| `--path` | Show config file path |
| `-m, --method <id>` | Set calculation method |
| `-s, --school <id>` | Set school (0=Shafi, 1=Hanafi) |
| `-t, --timezone <tz>` | Set timezone |
| `--24h` | Use 24-hour format |
| `--12h` | Use 12-hour format |

## Calculation Methods

| ID | Name | Region |
|----|------|--------|
| 0 | Jafari | Shia Ithna-Ashari |
| 1 | Karachi | Pakistan, Bangladesh, India |
| 2 | ISNA | North America |
| 3 | MWL | Europe, Far East |
| 4 | Makkah | Arabian Peninsula |
| 5 | Egypt | Africa, Syria, Lebanon |
| 7 | Tehran | Iran (Shia) |
| 8 | Gulf | Gulf Region |
| 9 | Kuwait | Kuwait |
| 10 | Qatar | Qatar |
| 11 | Singapore | Singapore, Malaysia |
| 12 | France | France |
| 13 | Turkey | Turkey |
| 14 | Russia | Russia |
| 15 | Moonsighting | Worldwide |
| 16 | Dubai | UAE |
| 17 | JAKIM | Malaysia |
| 18 | Tunisia | Tunisia |
| 19 | Algeria | Algeria |
| 20 | Indonesia | Indonesia |
| 21 | Morocco | Morocco |
| 22 | Portugal | Portugal |
| 23 | Jordan | Jordan |

## Schools (Asr Calculation)

| ID | Name | Description |
|----|------|-------------|
| 0 | Shafi | Shadow equals object length |
| 1 | Hanafi | Shadow equals 2x object length (later Asr) |

## Default Settings

- **Method**: 2 (ISNA)
- **School**: 0 (Shafi)
- **Format**: 12-hour

## Config Storage

Configuration stored using `conf` package at:
- macOS: `~/Library/Preferences/azaan-nodejs/config.json`
- Linux: `~/.config/azaan-nodejs/config.json`
- Windows: `%APPDATA%/azaan-nodejs/config.json`

## API

Uses [Aladhan Prayer Times API](https://aladhan.com/prayer-times-api):
- Base URL: `https://api.aladhan.com/v1`
- Endpoints: `/timings`, `/timingsByCity`, `/calendar`, `/methods`

## Output Format

### Standard Output
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

### Plain Output (`--plain`)
```
  AZAAN - Prayer Times CLI

  Lahore, Pakistan
  Asia/Karachi
  01 Feb 2026
  13 Shaʿbān 1447 AH

  Fajr       5:47 AM
  Sunrise    6:56 AM
  Dhuhr      12:16 PM
  Asr        3:14 PM <- current
  Maghrib    5:37 PM <- next in 45m
  Isha       6:46 PM
```

## Dependencies

- `commander` - CLI framework
- `conf` - Config storage (Sindre Sorhus)
- `@clack/prompts` - Interactive prompts
- `ora` - Loading spinners
- `picocolors` - Terminal colors

## Build

- TypeScript with tsup
- ESM output
- Node.js >= 18
