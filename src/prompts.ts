import * as p from '@clack/prompts';
import pc from 'picocolors';
import {setLocation, setMethod, setTimezone} from './config.js';
import {guessLocation} from './geo.js';

export const promptLocation = async (): Promise<{city: string; country: string} | null> => {
	p.intro(pc.cyan('Azaan Setup'));

	const s = p.spinner();
	s.start('Detecting your location...');

	const guessed = await guessLocation();
	s.stop(guessed ? `Detected: ${guessed.city}, ${guessed.country}` : 'Could not detect location');

	const city = await p.text({
		message: 'Enter your city',
		placeholder: 'e.g., San Francisco',
		defaultValue: guessed?.city,
		initialValue: guessed?.city,
		validate: (value) => {
			if (!value) return 'City is required';
		},
	});

	if (p.isCancel(city)) {
		p.cancel('Setup cancelled');
		return null;
	}

	const country = await p.text({
		message: 'Enter your country',
		placeholder: 'e.g., USA',
		defaultValue: guessed?.country,
		initialValue: guessed?.country,
		validate: (value) => {
			if (!value) return 'Country is required';
		},
	});

	if (p.isCancel(country)) {
		p.cancel('Setup cancelled');
		return null;
	}

	const method = await p.select({
		message: 'Select calculation method',
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
		p.cancel('Setup cancelled');
		return null;
	}

	setLocation({city: city as string, country: country as string});
	setMethod(method as number);

	if (guessed?.timezone) {
		setTimezone(guessed.timezone);
	}

	p.outro(pc.green('Setup complete! Reconfigure anytime with: azaan config'));

	return {city: city as string, country: country as string};
};
