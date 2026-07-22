import ora from 'ora';
import pc from 'picocolors';
import {fetchQibla} from '../api.js';
import {getLocation, hasLocation} from '../config.js';
import {banner} from '../utils.js';
import {guessLocation} from '../geo.js';

const getCompassDirection = (degrees: number): string => {
	const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
	const index = Math.round(degrees / 22.5) % 16;
	return directions[index];
};

const getCompassEmoji = (degrees: number): string => {
	if (degrees >= 337.5 || degrees < 22.5) return '⬆️';
	if (degrees >= 22.5 && degrees < 67.5) return '↗️';
	if (degrees >= 67.5 && degrees < 112.5) return '➡️';
	if (degrees >= 112.5 && degrees < 157.5) return '↘️';
	if (degrees >= 157.5 && degrees < 202.5) return '⬇️';
	if (degrees >= 202.5 && degrees < 247.5) return '↙️';
	if (degrees >= 247.5 && degrees < 292.5) return '⬅️';
	return '↖️';
};

interface QiblaOptions {
	json?: boolean;
}

export const qibla = async (opts: QiblaOptions = {}): Promise<void> => {
	const loc = getLocation();
	let lat = loc.latitude;
	let lon = loc.longitude;

	// If no coordinates, try to get from geolocation
	if (lat === undefined || lon === undefined) {
		if (!opts.json) {
			const spinner = ora({text: 'Detecting location...', stream: process.stdout}).start();
			const guessed = await guessLocation();
			if (guessed) {
				lat = guessed.latitude;
				lon = guessed.longitude;
				spinner.stop();
			} else {
				spinner.fail('Could not detect location. Run: azaan config');
				process.exit(1);
			}
		} else {
			console.error('No location configured. Run: azaan config');
			process.exit(1);
		}
	}

	const spinner = opts.json ? null : ora({text: 'Calculating Qibla direction...', stream: process.stdout}).start();

	try {
		const data = await fetchQibla(lat!, lon!);
		spinner?.stop();

		if (opts.json) {
			console.log(JSON.stringify({
				latitude: data.latitude,
				longitude: data.longitude,
				direction: data.direction,
				compass: getCompassDirection(data.direction),
			}, null, 2));
			return;
		}

		console.log(banner);
		console.log('');
		console.log(`  🕋  ${pc.bold('Qibla Direction')}`);
		console.log('');
		console.log(`  ${getCompassEmoji(data.direction)}  ${pc.cyan(pc.bold(`${data.direction.toFixed(2)}°`))} ${pc.dim(`(${getCompassDirection(data.direction)})`)}`);
		console.log('');
		console.log(pc.dim(`  From: ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`));
		console.log(pc.dim('  Direction is degrees clockwise from North'));
		console.log('');
	} catch (err) {
		spinner?.fail(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
		process.exit(1);
	}
};
