import ora from 'ora';
import pc from 'picocolors';
import {fetchTimingsByCity, fetchTimingsByCoords} from '../api.js';
import {config, getLocation, hasLocation, setLocation, setTimezone} from '../config.js';
import {banner, getNextPrayer, timeUntil, formatTime, getPrayerEmoji} from '../utils.js';
import {promptLocationChange} from '../prompts.js';

export const next = async (): Promise<void> => {
	if (!hasLocation()) {
		console.log(banner);
		console.log(pc.red('  No location configured. Run: azaan config --city <city> --country <country>'));
		console.log('');
		process.exit(1);
	}

	const savedLoc = getLocation();
	if (savedLoc.city && savedLoc.country) {
		const change = await promptLocationChange({city: savedLoc.city, country: savedLoc.country});
		if (change) {
			setLocation({city: change.city, country: change.country});
			if (change.timezone) setTimezone(change.timezone);
		}
	}

	const spinner = ora({text: 'Fetching next prayer...', stream: process.stdout}).start();

	try {
		const method = config.get('method');
		const school = config.get('school');
		const timezone = config.get('timezone');
		const format24h = config.get('format24h') ?? false;
		const loc = getLocation();

		let data;

		if (loc.latitude && loc.longitude) {
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
			spinner.fail('No location available');
			process.exit(1);
		}

		spinner.stop();
		console.log(banner);

		const nextPrayer = getNextPrayer(data.timings);
		if (nextPrayer) {
			const until = timeUntil(nextPrayer.time);
			const timeStr = formatTime(nextPrayer.time, format24h);
			const emoji = getPrayerEmoji(nextPrayer.name);

			console.log('');
			console.log(`  ${emoji}  ${pc.bold(pc.green(nextPrayer.name))}`);
			console.log(`  ${pc.dim('Time:')} ${pc.cyan(timeStr)}`);
			console.log(`  ${pc.dim('In:')}   ${pc.yellow(until)}`);
			console.log('');
		}
	} catch (err) {
		spinner.fail(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
		process.exit(1);
	}
};
