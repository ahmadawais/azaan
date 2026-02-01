import {Command, Option} from 'commander';
import {createRequire} from 'module';
import {today, next, configCommand, methods, month, reset, qibla} from './commands/index.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const program = new Command();

program
	.name('azaan')
	.description('Islamic prayer times CLI')
	.version(pkg.version, '-v, --version')
	.option('-c, --city <city>', 'City name')
	.option('-C, --country <country>', 'Country name')
	.option('--lat <latitude>', 'Latitude')
	.option('--lon <longitude>', 'Longitude')
	.option('-p, --plain', 'Plain text output (no colors/emojis)')
	.option('-j, --json', 'JSON output for scripting')
	.option('-s, --status', 'Single line status (for status bars)')
	.option('--reset', 'Reset all settings to defaults')
	.enablePositionalOptions()
	.passThroughOptions()
	.action(async (opts) => {
		if (opts.reset) {
			await reset();
			return;
		}
		await today({
			city: opts.city,
			country: opts.country,
			latitude: opts.lat,
			longitude: opts.lon,
			plain: opts.plain,
			json: opts.json,
			status: opts.status,
		});
	});

program
	.command('today')
	.description("Show today's prayer times")
	.option('-c, --city <city>', 'City name')
	.option('-C, --country <country>', 'Country name')
	.option('--lat <latitude>', 'Latitude')
	.option('--lon <longitude>', 'Longitude')
	.option('-p, --plain', 'Plain text output (no colors/emojis)')
	.option('-j, --json', 'JSON output for scripting')
	.option('-s, --status', 'Single line status (for status bars)')
	.action(async (opts) => {
		await today({
			city: opts.city,
			country: opts.country,
			latitude: opts.lat,
			longitude: opts.lon,
			plain: opts.plain,
			json: opts.json,
			status: opts.status,
		});
	});

program
	.command('next')
	.description('Show the next prayer time')
	.action(async () => {
		await next();
	});

program
	.command('month')
	.description('Show prayer times for the month')
	.option('-y, --year <year>', 'Year (default: current)')
	.option('-m, --month <month>', 'Month 1-12 (default: current)')
	.action(async (opts) => {
		await month({year: opts.year, month: opts.month});
	});

program
	.command('methods')
	.description('List available calculation methods')
	.action(async () => {
		await methods();
	});

program
	.command('qibla')
	.description('Show Qibla direction from your location')
	.option('-j, --json', 'JSON output')
	.action(async (opts) => {
		await qibla({json: opts.json});
	});

program
	.command('reset')
	.description('Reset all settings to defaults')
	.action(async () => {
		await reset();
	});

program
	.command('config')
	.description('Configure azaan settings (interactive if no flags)')
	.option('-c, --city <city>', 'Set city')
	.option('-C, --country <country>', 'Set country')
	.option('--lat <latitude>', 'Set latitude')
	.option('--lon <longitude>', 'Set longitude')
	.option('-m, --method <id>', 'Set calculation method ID')
	.option('-s, --school <id>', 'Set school (0=Shafi, 1=Hanafi)')
	.option('-t, --timezone <tz>', 'Set timezone')
	.option('--24h', 'Use 24-hour format')
	.option('--12h', 'Use 12-hour format')
	.option('--show', 'Show current configuration')
	.option('--clear', 'Clear all configuration')
	.option('--path', 'Show config file path')
	.addOption(new Option('--format24h').hideHelp())
	.action(async (opts) => {
		let format24h: boolean | undefined;
		if (opts['24h']) format24h = true;
		if (opts['12h']) format24h = false;

		await configCommand({
			city: opts.city,
			country: opts.country,
			latitude: opts.lat,
			longitude: opts.lon,
			method: opts.method,
			school: opts.school,
			timezone: opts.timezone,
			format24h,
			show: opts.show,
			clear: opts.clear,
			path: opts.path,
		});
	});

program.parse();
