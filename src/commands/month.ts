import ora from 'ora';
import pc from 'picocolors';
import {fetchCalendarByCity} from '../api.js';
import {config, getLocation, hasLocation} from '../config.js';
import {banner, formatTime, PRAYERS} from '../utils.js';

interface MonthOptions {
	year?: string;
	month?: string;
}

export const month = async (opts: MonthOptions): Promise<void> => {
	if (!hasLocation()) {
		console.log(banner);
		console.log(pc.red('  No location configured. Run: azaan config --city <city> --country <country>'));
		console.log('');
		process.exit(1);
	}

	const loc = getLocation();
	if (!loc.city || !loc.country) {
		console.log(banner);
		console.log(pc.red('  Month view requires city/country. Set with: azaan config --city <city> --country <country>'));
		console.log('');
		process.exit(1);
	}

	const spinner = ora({text: 'Fetching monthly calendar...', stream: process.stdout}).start();

	try {
		const now = new Date();
		const year = opts.year ? parseInt(opts.year, 10) : now.getFullYear();
		const monthNum = opts.month ? parseInt(opts.month, 10) : now.getMonth() + 1;
		const method = config.get('method');
		const school = config.get('school');
		const format24h = config.get('format24h') ?? false;

		const data = await fetchCalendarByCity({
			city: loc.city,
			country: loc.country,
			year,
			month: monthNum,
			method,
			school,
		});

		spinner.stop();
		console.log(banner);

		const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

		console.log(pc.dim(`  📅 ${monthNames[monthNum]} ${year} — ${loc.city}, ${loc.country}`));
		console.log('');

		const header = '  Day  ' + PRAYERS.map((p) => p.slice(0, 5).padEnd(7)).join(' ');
		console.log(pc.dim(header));
		console.log(pc.dim('  ' + '─'.repeat(header.length - 2)));

		for (const day of data) {
			const dayNum = day.date.gregorian.day.padStart(2);
			const times = PRAYERS.map((p) => formatTime(day.timings[p], format24h).padEnd(7)).join(' ');
			console.log(`  ${pc.cyan(dayNum)}   ${times}`);
		}

		console.log('');
	} catch (err) {
		spinner.fail(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
		process.exit(1);
	}
};
