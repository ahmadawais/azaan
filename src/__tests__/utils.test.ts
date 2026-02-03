import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	PRAYERS,
	banner,
	plainBanner,
	formatTime,
	getPrayerEmoji,
	getCurrentAndNextPrayer,
	getNextPrayer,
	timeUntil,
	renderTimings,
	renderDateInfo,
	renderDateInfoPlain,
	renderLocationInfo,
	renderLocationInfoPlain,
	type PrayerName,
} from '../utils.js';
import type { PrayerTimings } from '../api.js';

describe('utils', () => {
	describe('PRAYERS constant', () => {
		it('should contain all six prayers in order', () => {
			expect(PRAYERS).toEqual(['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']);
		});

		it('should be readonly', () => {
			expect(PRAYERS).toHaveLength(6);
		});
	});

	describe('banner', () => {
		it('should contain AZAAN text', () => {
			expect(banner).toContain('AZAAN');
		});

		it('should contain Prayer Times CLI text', () => {
			expect(banner).toContain('Prayer Times CLI');
		});
	});

	describe('plainBanner', () => {
		it('should contain AZAAN text without colors', () => {
			expect(plainBanner).toContain('AZAAN');
			expect(plainBanner).toContain('Prayer Times CLI');
		});
	});

	describe('formatTime', () => {
		it('should return 24h format unchanged', () => {
			expect(formatTime('13:30', true)).toBe('13:30');
			expect(formatTime('05:45', true)).toBe('05:45');
			expect(formatTime('00:00', true)).toBe('00:00');
		});

		it('should convert to 12h format for PM times', () => {
			expect(formatTime('13:30', false)).toBe('1:30 PM');
			expect(formatTime('18:45', false)).toBe('6:45 PM');
			expect(formatTime('23:59', false)).toBe('11:59 PM');
		});

		it('should convert to 12h format for AM times', () => {
			expect(formatTime('05:30', false)).toBe('5:30 AM');
			expect(formatTime('09:15', false)).toBe('9:15 AM');
			expect(formatTime('11:59', false)).toBe('11:59 AM');
		});

		it('should handle midnight correctly', () => {
			expect(formatTime('00:00', false)).toBe('12:00 AM');
			expect(formatTime('00:30', false)).toBe('12:30 AM');
		});

		it('should handle noon correctly', () => {
			expect(formatTime('12:00', false)).toBe('12:00 PM');
			expect(formatTime('12:30', false)).toBe('12:30 PM');
		});

		it('should strip timezone suffix', () => {
			expect(formatTime('13:30 (PKT)', true)).toBe('13:30');
			expect(formatTime('13:30 (PKT)', false)).toBe('1:30 PM');
		});

		it('should pad minutes correctly', () => {
			expect(formatTime('09:05', false)).toBe('9:05 AM');
			expect(formatTime('15:00', false)).toBe('3:00 PM');
		});
	});

	describe('getPrayerEmoji', () => {
		it('should return correct emoji for each prayer', () => {
			expect(getPrayerEmoji('Fajr')).toBe('🌅');
			expect(getPrayerEmoji('Sunrise')).toBe('☀️');
			expect(getPrayerEmoji('Dhuhr')).toBe('🌞');
			expect(getPrayerEmoji('Asr')).toBe('🌤️');
			expect(getPrayerEmoji('Maghrib')).toBe('🌇');
			expect(getPrayerEmoji('Isha')).toBe('🌙');
		});

		it('should return mosque emoji for unknown prayer', () => {
			expect(getPrayerEmoji('Unknown')).toBe('🕌');
			expect(getPrayerEmoji('')).toBe('🕌');
		});
	});

	describe('getCurrentAndNextPrayer', () => {
		const mockTimings: PrayerTimings = {
			Fajr: '05:30',
			Sunrise: '06:45',
			Dhuhr: '12:30',
			Asr: '15:45',
			Sunset: '18:15',
			Maghrib: '18:15',
			Isha: '19:45',
			Imsak: '05:20',
			Midnight: '00:00',
			Firstthird: '22:00',
			Lastthird: '02:00',
		};

		it('should return Fajr as next before first prayer', () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-02-01T04:00:00'));

			const result = getCurrentAndNextPrayer(mockTimings);

			expect(result.current).toBeNull();
			expect(result.next).toBe('Fajr');
			expect(result.nextTime).toBe('05:30');

			vi.useRealTimers();
		});

		it('should return current and next prayer during the day', () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-02-01T10:00:00'));

			const result = getCurrentAndNextPrayer(mockTimings);

			expect(result.current).toBe('Sunrise');
			expect(result.next).toBe('Dhuhr');
			expect(result.nextTime).toBe('12:30');

			vi.useRealTimers();
		});

		it('should return Fajr as next after Isha', () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-02-01T22:00:00'));

			const result = getCurrentAndNextPrayer(mockTimings);

			expect(result.current).toBe('Isha');
			expect(result.next).toBe('Fajr');
			expect(result.nextTime).toBe('05:30');

			vi.useRealTimers();
		});

		it('should handle exactly at prayer time', () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-02-01T12:30:00'));

			const result = getCurrentAndNextPrayer(mockTimings);

			expect(result.current).toBe('Dhuhr');
			expect(result.next).toBe('Asr');

			vi.useRealTimers();
		});

		it('should return Asr as current and Maghrib as next in afternoon', () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-02-01T17:00:00'));

			const result = getCurrentAndNextPrayer(mockTimings);

			expect(result.current).toBe('Asr');
			expect(result.next).toBe('Maghrib');

			vi.useRealTimers();
		});
	});

	describe('getNextPrayer', () => {
		const mockTimings: PrayerTimings = {
			Fajr: '05:30',
			Sunrise: '06:45',
			Dhuhr: '12:30',
			Asr: '15:45',
			Sunset: '18:15',
			Maghrib: '18:15',
			Isha: '19:45',
			Imsak: '05:20',
			Midnight: '00:00',
			Firstthird: '22:00',
			Lastthird: '02:00',
		};

		it('should return next prayer info', () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-02-01T10:00:00'));

			const result = getNextPrayer(mockTimings);

			expect(result).not.toBeNull();
			expect(result!.name).toBe('Dhuhr');
			expect(result!.time).toBe('12:30');

			vi.useRealTimers();
		});
	});

	describe('timeUntil', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should return minutes only when less than an hour', () => {
			vi.setSystemTime(new Date('2026-02-01T12:00:00'));

			expect(timeUntil('12:30')).toBe('30m');
			expect(timeUntil('12:45')).toBe('45m');
		});

		it('should return hours and minutes', () => {
			vi.setSystemTime(new Date('2026-02-01T10:00:00'));

			expect(timeUntil('12:30')).toBe('2h 30m');
			expect(timeUntil('15:45')).toBe('5h 45m');
		});

		it('should handle next day calculation', () => {
			vi.setSystemTime(new Date('2026-02-01T23:00:00'));

			const result = timeUntil('05:30');
			expect(result).toBe('6h 30m');
		});

		it('should handle exactly at time (next day)', () => {
			vi.setSystemTime(new Date('2026-02-01T12:30:00'));

			const result = timeUntil('12:30');
			// Should be ~24 hours (next day)
			expect(result).toContain('h');
		});
	});

	describe('renderTimings', () => {
		const mockTimings: PrayerTimings = {
			Fajr: '05:30',
			Sunrise: '06:45',
			Dhuhr: '12:30',
			Asr: '15:45',
			Sunset: '18:15',
			Maghrib: '18:15',
			Isha: '19:45',
			Imsak: '05:20',
			Midnight: '00:00',
			Firstthird: '22:00',
			Lastthird: '02:00',
		};

		beforeEach(() => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-02-01T10:00:00'));
			vi.spyOn(console, 'log').mockImplementation(() => {});
		});

		afterEach(() => {
			vi.useRealTimers();
			vi.restoreAllMocks();
		});

		it('should render timings in 12h format', () => {
			renderTimings(mockTimings, { format24h: false });

			expect(console.log).toHaveBeenCalled();
		});

		it('should render timings in 24h format', () => {
			renderTimings(mockTimings, { format24h: true });

			expect(console.log).toHaveBeenCalled();
		});

		it('should render timings in plain mode', () => {
			renderTimings(mockTimings, { format24h: false, plain: true });

			expect(console.log).toHaveBeenCalled();
		});
	});

	describe('renderDateInfo', () => {
		beforeEach(() => {
			vi.spyOn(console, 'log').mockImplementation(() => {});
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it('should render date info', () => {
			renderDateInfo('01 Feb 2026', { day: '3', month: { en: 'Rajab' }, year: '1447' });

			expect(console.log).toHaveBeenCalledTimes(2);
		});
	});

	describe('renderDateInfoPlain', () => {
		beforeEach(() => {
			vi.spyOn(console, 'log').mockImplementation(() => {});
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it('should render date info without colors', () => {
			renderDateInfoPlain('01 Feb 2026', { day: '3', month: { en: 'Rajab' }, year: '1447' });

			expect(console.log).toHaveBeenCalledTimes(2);
		});
	});

	describe('renderLocationInfo', () => {
		beforeEach(() => {
			vi.spyOn(console, 'log').mockImplementation(() => {});
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it('should render location info', () => {
			renderLocationInfo('Lahore', 'Pakistan', 'Asia/Karachi');

			expect(console.log).toHaveBeenCalledTimes(2);
		});
	});

	describe('renderLocationInfoPlain', () => {
		beforeEach(() => {
			vi.spyOn(console, 'log').mockImplementation(() => {});
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it('should render location info without colors', () => {
			renderLocationInfoPlain('Lahore', 'Pakistan', 'Asia/Karachi');

			expect(console.log).toHaveBeenCalledTimes(2);
		});
	});
});
