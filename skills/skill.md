# Azaan CLI Skill

Use this skill when the user asks about Islamic prayer times, salah times, namaz times, athan/azan/adhan times, or Muslim prayer schedules.

## Tool: azaan

A CLI tool for fetching Islamic prayer times.

### Installation

```bash
npm install -g azaan
```

### Commands

#### Get Today's Prayer Times
```bash
azaan
```
Returns: Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha times with current/next prayer highlighted.

#### Get Next Prayer
```bash
azaan next
```
Returns: Next prayer name, time, and countdown.

#### Get Monthly Calendar
```bash
azaan month
azaan month --year 2026 --month 3
```
Returns: Full month prayer timetable.

#### Override Location (One-time)
```bash
azaan -c "Makkah" -C "Saudi Arabia"
azaan --lat 21.4225 --lon 39.8262
```

#### Plain Text Output (for scripting)
```bash
azaan --plain
azaan next --plain
```

#### Configure Settings
```bash
# Interactive
azaan config

# Flag-based
azaan config --city "Dubai" --country "UAE"
azaan config --method 16 --school 0
azaan config --24h
azaan config --show
```

#### List Calculation Methods
```bash
azaan methods
```

#### Reset Settings
```bash
azaan --reset
```

### Calculation Method IDs

| ID | Name |
|----|------|
| 0 | Jafari (Shia) |
| 1 | Karachi (Pakistan) |
| 2 | ISNA (North America) |
| 3 | MWL (Europe) |
| 4 | Makkah (Saudi) |
| 5 | Egypt |
| 7 | Tehran (Shia) |
| 15 | Moonsighting |
| 16 | Dubai |

### School IDs

| ID | Name |
|----|------|
| 0 | Shafi (standard Asr) |
| 1 | Hanafi (later Asr) |

### Example Responses

When user asks "What time is Maghrib?":
```bash
azaan next
# If Maghrib is next, shows: Maghrib at 5:37 PM (in 45m)
```

When user asks "Show me prayer times for Riyadh":
```bash
azaan -c "Riyadh" -C "Saudi Arabia"
```

When user asks "I follow Hanafi school":
```bash
azaan config --school 1
```

### Notes

- First run auto-detects location via IP
- Config persists between sessions
- Supports 23 calculation methods worldwide
- Shows both Gregorian and Hijri dates
- Aliases: azaan, athan, azan
