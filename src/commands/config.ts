import * as p from '@clack/prompts';
import pc from 'picocolors';
import {
	config,
	setLocation,
	setMethod,
	setSchool,
	setTimezone,
	setFormat24h,
	getAllConfig,
	clearConfig,
} from '../config.js';
import {banner} from '../utils.js';
import {guessLocation} from '../geo.js';

interface ConfigOptions {
	city?: string;
	country?: string;
	latitude?: string;
	longitude?: string;
	method?: string;
	school?: string;
	timezone?: string;
	format24h?: boolean;
	show?: boolean;
	clear?: boolean;
	path?: boolean;
}

const interactiveConfig = async (): Promise<void> => {
	const currentConfig = getAllConfig();

	p.intro(pc.cyan('Azaan Configuration'));

	// Try to guess location if not already configured
	let guessed: Awaited<ReturnType<typeof guessLocation>> = null;
	if (!currentConfig.city && !currentConfig.country) {
		const s = p.spinner();
		s.start('Detecting your location...');
		guessed = await guessLocation();
		s.stop(guessed ? `Detected: ${guessed.city}, ${guessed.country}` : 'Could not detect location');
	}

	const locationType = await p.select({
		message: 'How would you like to set your location?',
		options: [
			{value: 'city', label: 'City & Country', hint: 'e.g., Lahore, Pakistan'},
			{value: 'coords', label: 'Coordinates', hint: 'Latitude & Longitude'},
		],
	});

	if (p.isCancel(locationType)) {
		p.cancel('Configuration cancelled');
		process.exit(0);
	}

	if (locationType === 'city') {
		const cityDefault = currentConfig.city || guessed?.city;
		const city = await p.text({
			message: 'Enter your city',
			placeholder: 'e.g., San Francisco',
			defaultValue: cityDefault,
			initialValue: cityDefault,
		});

		if (p.isCancel(city)) {
			p.cancel('Configuration cancelled');
			process.exit(0);
		}

		const countryDefault = currentConfig.country || guessed?.country;
		const country = await p.text({
			message: 'Enter your country',
			placeholder: 'e.g., USA',
			defaultValue: countryDefault,
			initialValue: countryDefault,
		});

		if (p.isCancel(country)) {
			p.cancel('Configuration cancelled');
			process.exit(0);
		}

		setLocation({city: city as string, country: country as string});
	} else {
		const latitude = await p.text({
			message: 'Enter latitude',
			placeholder: currentConfig.latitude?.toString() || 'e.g., 37.7749',
			defaultValue: currentConfig.latitude?.toString(),
			validate: (value) => {
				const num = parseFloat(value);
				if (isNaN(num) || num < -90 || num > 90) return 'Invalid latitude (-90 to 90)';
			},
		});

		if (p.isCancel(latitude)) {
			p.cancel('Configuration cancelled');
			process.exit(0);
		}

		const longitude = await p.text({
			message: 'Enter longitude',
			placeholder: currentConfig.longitude?.toString() || 'e.g., -122.4194',
			defaultValue: currentConfig.longitude?.toString(),
			validate: (value) => {
				const num = parseFloat(value);
				if (isNaN(num) || num < -180 || num > 180) return 'Invalid longitude (-180 to 180)';
			},
		});

		if (p.isCancel(longitude)) {
			p.cancel('Configuration cancelled');
			process.exit(0);
		}

		setLocation({
			latitude: parseFloat(latitude as string),
			longitude: parseFloat(longitude as string),
		});
	}

	const method = await p.select({
		message: 'Select calculation method',
		initialValue: currentConfig.method ?? 2,
		options: [
			{value: 0, label: 'Jafari (Shia Ithna-Ashari)'},
			{value: 1, label: 'Karachi (Pakistan)'},
			{value: 2, label: 'ISNA (North America)'},
			{value: 3, label: 'MWL (Muslim World League)'},
			{value: 4, label: 'Makkah (Umm al-Qura)'},
			{value: 5, label: 'Egypt'},
			{value: 7, label: 'Tehran (Shia)'},
			{value: 8, label: 'Gulf Region'},
			{value: 9, label: 'Kuwait'},
			{value: 10, label: 'Qatar'},
			{value: 11, label: 'Singapore'},
			{value: 12, label: 'France'},
			{value: 13, label: 'Turkey'},
			{value: 14, label: 'Russia'},
			{value: 15, label: 'Moonsighting Committee'},
			{value: 16, label: 'Dubai'},
			{value: 17, label: 'Malaysia (JAKIM)'},
			{value: 18, label: 'Tunisia'},
			{value: 19, label: 'Algeria'},
			{value: 20, label: 'Indonesia'},
			{value: 21, label: 'Morocco'},
			{value: 22, label: 'Portugal'},
			{value: 23, label: 'Jordan'},
		],
	});

	if (p.isCancel(method)) {
		p.cancel('Configuration cancelled');
		process.exit(0);
	}

	setMethod(method as number);

	const school = await p.select({
		message: 'Select Asr calculation school',
		initialValue: currentConfig.school ?? 0,
		options: [
			{value: 0, label: 'Shafi', hint: 'Standard (shadow = object length)'},
			{value: 1, label: 'Hanafi', hint: 'Later Asr (shadow = 2x object length)'},
		],
	});

	if (p.isCancel(school)) {
		p.cancel('Configuration cancelled');
		process.exit(0);
	}

	setSchool(school as number);

	const timeFormat = await p.select({
		message: 'Time format',
		initialValue: currentConfig.format24h ? '24h' : '12h',
		options: [
			{value: '12h', label: '12-hour', hint: '5:30 PM'},
			{value: '24h', label: '24-hour', hint: '17:30'},
		],
	});

	if (p.isCancel(timeFormat)) {
		p.cancel('Configuration cancelled');
		process.exit(0);
	}

	setFormat24h(timeFormat === '24h');

	const setTz = await p.confirm({
		message: 'Set custom timezone?',
		initialValue: !!currentConfig.timezone,
	});

	if (p.isCancel(setTz)) {
		p.cancel('Configuration cancelled');
		process.exit(0);
	}

	if (setTz) {
		const timezone = await p.text({
			message: 'Enter timezone',
			placeholder: currentConfig.timezone || 'e.g., America/Los_Angeles',
			defaultValue: currentConfig.timezone,
		});

		if (p.isCancel(timezone)) {
			p.cancel('Configuration cancelled');
			process.exit(0);
		}

		setTimezone(timezone as string);
	}

	p.outro(pc.green('Configuration saved!'));
};

export const configCommand = async (opts: ConfigOptions): Promise<void> => {
	// Handle special flags first
	if (opts.path) {
		console.log(banner);
		console.log(`  ${pc.dim('Config path:')} ${config.path}`);
		console.log('');
		return;
	}

	if (opts.clear) {
		console.log(banner);
		clearConfig();
		console.log(pc.green('  Config cleared successfully.'));
		console.log('');
		return;
	}

	if (opts.show) {
		console.log(banner);
		const cfg = getAllConfig();
		console.log(pc.dim('  Current configuration:'));
		console.log('');
		if (cfg.city) console.log(`  ${pc.dim('City:')}      ${cfg.city}`);
		if (cfg.country) console.log(`  ${pc.dim('Country:')}   ${cfg.country}`);
		if (cfg.latitude) console.log(`  ${pc.dim('Latitude:')}  ${cfg.latitude}`);
		if (cfg.longitude) console.log(`  ${pc.dim('Longitude:')} ${cfg.longitude}`);
		console.log(`  ${pc.dim('Method:')}    ${cfg.method ?? 2}`);
		console.log(`  ${pc.dim('School:')}    ${cfg.school === 1 ? 'Hanafi' : 'Shafi'}`);
		if (cfg.timezone) console.log(`  ${pc.dim('Timezone:')}  ${cfg.timezone}`);
		console.log(`  ${pc.dim('Format:')}    ${cfg.format24h ? '24h' : '12h'}`);
		console.log('');
		return;
	}

	// Check if any flag-based options provided
	const hasFlags = opts.city || opts.country || opts.latitude || opts.longitude ||
		opts.method !== undefined || opts.school !== undefined ||
		opts.timezone || opts.format24h !== undefined;

	// If no flags, launch interactive config
	if (!hasFlags) {
		await interactiveConfig();
		return;
	}

	// Flag-based configuration
	console.log(banner);

	if (opts.city || opts.country || opts.latitude || opts.longitude) {
		setLocation({
			city: opts.city,
			country: opts.country,
			latitude: opts.latitude ? parseFloat(opts.latitude) : undefined,
			longitude: opts.longitude ? parseFloat(opts.longitude) : undefined,
		});
	}

	if (opts.method !== undefined) {
		setMethod(parseInt(opts.method, 10));
	}

	if (opts.school !== undefined) {
		setSchool(parseInt(opts.school, 10));
	}

	if (opts.timezone) {
		setTimezone(opts.timezone);
	}

	if (opts.format24h !== undefined) {
		setFormat24h(opts.format24h);
	}

	console.log(pc.green('  Configuration updated successfully.'));
	console.log('');
};
