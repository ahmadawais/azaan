import ora from 'ora';
import pc from 'picocolors';
import {fetchTimingsByCity, fetchTimingsByCoords, type PrayerData} from '../api.js';
import {config, getLocation, hasLocation, setLocation, setTimezone} from '../config.js';
import {banner, plainBanner, renderTimings, renderDateInfo, renderLocationInfo, renderDateInfoPlain, renderLocationInfoPlain, getCurrentAndNextPrayer, timeUntil, formatTime, PRAYERS} from '../utils.js';
import {promptLocation, promptLocationChange} from '../prompts.js';

interface TodayOptions {
	city?: string;
	country?: string;
	latitude?: string;
	longitude?: string;
	plain?: boolean;
	json?: boolean;
	status?: boolean;
}

const outputJson = (data: PrayerData, city: string, country: string): void => {
	const {current, next, nextTime} = getCurrentAndNextPrayer(data.timings);
	const output = {
		location: {city, country, timezone: data.meta.timezone},
		date: {
			gregorian: data.date.readable,
			hijri: `${data.date.hijri.day} ${data.date.hijri.month.en} ${data.date.hijri.year}`,
		},
		timings: Object.fromEntries(
			PRAYERS.map((p) => [p.toLowerCase(), data.timings[p].split(' ')[0]])
		),
		current: current?.toLowerCase() || null,
		next: {
			prayer: next.toLowerCase(),
			time: nextTime.split(' ')[0],
			remaining: timeUntil(nextTime),
		},
	};
	console.log(JSON.stringify(output, null, 2));
};

const outputStatus = (data: PrayerData, format24h: boolean): void => {
	const {next, nextTime} = getCurrentAndNextPrayer(data.timings);
	const remaining = timeUntil(nextTime);
	const time = formatTime(nextTime, format24h);
	console.log(`${next} ${time} (${remaining})`);
};

export const today = async (opts: TodayOptions): Promise<void> => {
	// For JSON/status mode, don't show interactive prompts
	if ((opts.json || opts.status) && !hasLocation() && !opts.city && !opts.latitude) {
		console.error('No location configured. Run: azaan config');
		process.exit(1);
	}

	if (!hasLocation() && !opts.city && !opts.latitude) {
		console.log(banner);
		const location = await promptLocation();
		if (!location) {
			process.exit(0);
		}
		setLocation(location);
	}

	// If using saved location, check whether user traveled & update it
	if (!opts.json && !opts.status && !opts.city && !opts.latitude) {
		const savedLoc = getLocation();
		if (savedLoc.city && savedLoc.country) {
			const change = await promptLocationChange({city: savedLoc.city, country: savedLoc.country});
			if (change) {
				setLocation({city: change.city, country: change.country});
				if (change.timezone) setTimezone(change.timezone);
			}
		}
	}

	const spinner = opts.json || opts.status
		? null
		: ora({text: 'Fetching prayer times...', stream: process.stdout}).start();

	try {
		const method = config.get('method');
		const school = config.get('school');
		const timezone = config.get('timezone');
		const format24h = config.get('format24h') ?? false;
		const loc = getLocation();

		let data;

		if (opts.latitude && opts.longitude) {
			data = await fetchTimingsByCoords({
				latitude: parseFloat(opts.latitude),
				longitude: parseFloat(opts.longitude),
				method,
				school,
				timezone,
			});
		} else if (opts.city && opts.country) {
			data = await fetchTimingsByCity({
				city: opts.city,
				country: opts.country,
				method,
				school,
			});
		} else if (loc.latitude && loc.longitude) {
			data = await fetchTimingsByCoords({
				latitude: loc.latitude,
				longitude: loc.longitude,
				method,
				school,
				timezone,
			});
		} else if (loc.city && loc.country) {
			data = await fetchTimingsByCity({
				city: loc.city,
				country: loc.country,
				method,
				school,
			});
		} else {
			spinner?.fail('No location available');
			process.exit(1);
		}

		spinner?.stop();

		const city = opts.city || loc.city || `${data.meta.latitude}, ${data.meta.longitude}`;
		const country = opts.country || loc.country || '';

		// JSON output
		if (opts.json) {
			outputJson(data, city, country);
			return;
		}

		// Status bar output (single line)
		if (opts.status) {
			outputStatus(data, format24h);
			return;
		}

		// Normal output
		console.log(opts.plain ? plainBanner : banner);

		if (opts.plain) {
			renderLocationInfoPlain(city, country, data.meta.timezone);
			renderDateInfoPlain(data.date.readable, data.date.hijri);
		} else {
			renderLocationInfo(city, country, data.meta.timezone);
			renderDateInfo(data.date.readable, data.date.hijri);
		}
		renderTimings(data.timings, {format24h, plain: opts.plain});
	} catch (err) {
		spinner?.fail(`Failed to fetch prayer times: ${err instanceof Error ? err.message : 'Unknown error'}`);
		process.exit(1);
	}
};
