import pc from 'picocolors';
import type {PrayerTimings} from './api.js';

export const PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
export type PrayerName = (typeof PRAYERS)[number];

export const banner = `
  ${pc.white(pc.bold('AZAAN'))} ${pc.dim('- Prayer Times CLI')}
`;

export const plainBanner = `
  AZAAN - Prayer Times CLI
`;

export const formatTime = (time: string, format24h: boolean): string => {
	// Remove timezone suffix like "(PKT)" if present
	const cleanTime = time.split(' ')[0];
	if (format24h) return cleanTime;

	const [hours, minutes] = cleanTime.split(':').map(Number);
	const period = hours >= 12 ? 'PM' : 'AM';
	const h = hours % 12 || 12;
	return `${h}:${String(minutes).padStart(2, '0')} ${period}`;
};

export const getPrayerEmoji = (prayer: string): string => {
	const emojis: Record<string, string> = {
		Fajr: '🌅',
		Sunrise: '☀️',
		Dhuhr: '🌞',
		Asr: '🌤️',
		Maghrib: '🌇',
		Isha: '🌙',
	};
	return emojis[prayer] || '🕌';
};

export const getCurrentAndNextPrayer = (
	timings: PrayerTimings
): {current: PrayerName | null; next: PrayerName; nextTime: string} => {
	const now = new Date();
	const currentMinutes = now.getHours() * 60 + now.getMinutes();

	let current: PrayerName | null = null;
	let next: PrayerName = 'Fajr';
	let nextTime = timings.Fajr;

	for (let i = 0; i < PRAYERS.length; i++) {
		const prayer = PRAYERS[i];
		const [h, m] = timings[prayer].split(':').map(Number);
		const prayerMinutes = h * 60 + m;

		if (prayerMinutes <= currentMinutes) {
			current = prayer;
		} else {
			next = prayer;
			nextTime = timings[prayer];
			break;
		}
	}

	if (current === PRAYERS[PRAYERS.length - 1]) {
		next = 'Fajr';
		nextTime = timings.Fajr;
	}

	return {current, next, nextTime};
};

export const getNextPrayer = (timings: PrayerTimings): {name: PrayerName; time: string} | null => {
	const {next, nextTime} = getCurrentAndNextPrayer(timings);
	return {name: next, time: nextTime};
};

export const timeUntil = (timeStr: string): string => {
	const now = new Date();
	const [h, m] = timeStr.split(':').map(Number);
	const target = new Date(now);
	target.setHours(h, m, 0, 0);

	if (target <= now) {
		target.setDate(target.getDate() + 1);
	}

	const diff = target.getTime() - now.getTime();
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

	if (hours === 0) return `${minutes}m`;
	return `${hours}h ${minutes}m`;
};

export interface RenderOptions {
	format24h: boolean;
	plain?: boolean;
}

export const renderTimings = (timings: PrayerTimings, opts: RenderOptions): void => {
	console.log('');

	const {current, next, nextTime} = getCurrentAndNextPrayer(timings);
	const until = timeUntil(nextTime);

	for (const prayer of PRAYERS) {
		const time = formatTime(timings[prayer], opts.format24h);

		if (opts.plain) {
			let suffix = '';
			if (prayer === current) suffix = ' <- current';
			else if (prayer === next) suffix = ` <- next in ${until}`;
			console.log(`  ${prayer.padEnd(10)} ${time}${suffix}`);
		} else {
			const emoji = getPrayerEmoji(prayer);
			if (prayer === current) {
				console.log(`  ${emoji}  ${pc.green(pc.bold(prayer.padEnd(10)))} ${pc.green(time)} ${pc.dim('← current')}`);
			} else if (prayer === next) {
				console.log(`  ${emoji}  ${pc.yellow(pc.bold(prayer.padEnd(10)))} ${pc.yellow(time)} ${pc.dim(`← next in ${until}`)}`);
			} else {
				console.log(`  ${emoji}  ${pc.dim(prayer.padEnd(10))} ${pc.dim(time)}`);
			}
		}
	}
	console.log('');
};

export const renderDateInfoPlain = (readable: string, hijri: {day: string; month: {en: string}; year: string}): void => {
	const hijriDate = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
	console.log(`  ${readable}`);
	console.log(`  ${hijriDate}`);
};

export const renderLocationInfoPlain = (city: string, country: string, timezone: string): void => {
	console.log(`  ${city}, ${country}`);
	console.log(`  ${timezone}`);
};

export const renderDateInfo = (readable: string, hijri: {day: string; month: {en: string}; year: string}): void => {
	const hijriDate = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
	console.log(pc.dim(`  📅 ${readable}`));
	console.log(pc.dim(`  🌙 ${hijriDate}`));
};

export const renderLocationInfo = (city: string, country: string, timezone: string): void => {
	console.log(pc.dim(`  📍 ${city}, ${country}`));
	console.log(pc.dim(`  🕐 ${timezone}`));
};
