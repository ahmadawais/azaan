import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock ora before importing modules
vi.mock('ora', () => ({
	default: () => ({
		start: vi.fn().mockReturnThis(),
		stop: vi.fn().mockReturnThis(),
		fail: vi.fn().mockReturnThis(),
	}),
}));

vi.mock('../../api.js', () => ({
	fetchTimingsByCity: vi.fn(),
	fetchTimingsByCoords: vi.fn(),
}));

vi.mock('../../config.js', () => ({
	config: {
		get: vi.fn(),
	},
	getLocation: vi.fn(),
	hasLocation: vi.fn(),
}));

import { next } from '../../commands/next.js';
import { fetchTimingsByCity, fetchTimingsByCoords } from '../../api.js';
import { config, getLocation, hasLocation } from '../../config.js';

describe('next command', () => {
	const mockPrayerData = {
		timings: {
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
		},
		date: {
			readable: '01 Feb 2026',
			timestamp: '1738368000',
			hijri: {
				date: '03-07-1447',
				day: '3',
				month: { number: 7, en: 'Rajab', ar: 'رَجَب' },
				year: '1447',
				weekday: { en: 'Sunday', ar: 'الأحد' },
			},
			gregorian: {
				date: '01-02-2026',
				day: '01',
				month: { number: 2, en: 'February' },
				year: '2026',
				weekday: { en: 'Sunday' },
			},
		},
		meta: {
			latitude: 31.5204,
			longitude: 74.3587,
			timezone: 'Asia/Karachi',
			method: { id: 1, name: 'Karachi' },
			school: { id: 1, name: 'Hanafi' },
		},
	};

	let mockExit: ReturnType<typeof vi.spyOn>;
	let mockConsoleLog: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-02-01T10:00:00'));

		mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
			throw new Error('process.exit called');
		});
		mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

		vi.mocked(config.get).mockImplementation((key: string) => {
			const defaults: Record<string, unknown> = {
				method: 2,
				school: 0,
				timezone: undefined,
				format24h: false,
			};
			return defaults[key] as never;
		});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	describe('when location is not configured', () => {
		it('should exit with error message', async () => {
			vi.mocked(hasLocation).mockReturnValue(false);

			await expect(next()).rejects.toThrow('process.exit called');

			expect(mockExit).toHaveBeenCalledWith(1);
		});

		it('should display configuration instructions', async () => {
			vi.mocked(hasLocation).mockReturnValue(false);

			await expect(next()).rejects.toThrow();

			const errorCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('No location configured')
			);
			expect(errorCall).toBeDefined();
		});
	});

	describe('with city/country location', () => {
		it('should fetch and display next prayer', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchTimingsByCity).mockResolvedValue(mockPrayerData);

			await next();

			expect(fetchTimingsByCity).toHaveBeenCalledWith({
				city: 'Lahore',
				country: 'Pakistan',
				method: 2,
				school: 0,
			});
		});

		it('should display next prayer name', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchTimingsByCity).mockResolvedValue(mockPrayerData);

			await next();

			// Should log the next prayer (Dhuhr at 10:00 AM)
			const prayerCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('Dhuhr')
			);
			expect(prayerCall).toBeDefined();
		});
	});

	describe('with coordinate location', () => {
		it('should fetch prayer times by coordinates', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ latitude: 31.5204, longitude: 74.3587 });
			vi.mocked(fetchTimingsByCoords).mockResolvedValue(mockPrayerData);

			await next();

			expect(fetchTimingsByCoords).toHaveBeenCalledWith({
				latitude: 31.5204,
				longitude: 74.3587,
				method: 2,
				school: 0,
				timezone: undefined,
			});
		});

		it('should include timezone when configured', async () => {
			vi.mocked(config.get).mockImplementation((key: string) => {
				if (key === 'timezone') return 'Asia/Karachi';
				if (key === 'method') return 2;
				if (key === 'school') return 0;
				return undefined;
			});
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ latitude: 31.5204, longitude: 74.3587 });
			vi.mocked(fetchTimingsByCoords).mockResolvedValue(mockPrayerData);

			await next();

			expect(fetchTimingsByCoords).toHaveBeenCalledWith(
				expect.objectContaining({ timezone: 'Asia/Karachi' })
			);
		});
	});

	describe('time formatting', () => {
		it('should use 12h format by default', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchTimingsByCity).mockResolvedValue(mockPrayerData);

			await next();

			// Check that 12h format is used (contains AM/PM)
			const timeCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && (call[0].includes('AM') || call[0].includes('PM'))
			);
			expect(timeCall).toBeDefined();
		});

		it('should use 24h format when configured', async () => {
			vi.mocked(config.get).mockImplementation((key: string) => {
				if (key === 'format24h') return true;
				if (key === 'method') return 2;
				if (key === 'school') return 0;
				return undefined;
			});
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchTimingsByCity).mockResolvedValue(mockPrayerData);

			await next();

			expect(mockConsoleLog).toHaveBeenCalled();
		});
	});

	describe('error handling', () => {
		it('should handle API errors', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'InvalidCity', country: 'Country' });
			vi.mocked(fetchTimingsByCity).mockRejectedValue(new Error('API Error'));

			await expect(next()).rejects.toThrow('process.exit called');

			expect(mockExit).toHaveBeenCalledWith(1);
		});

		it('should handle unknown errors', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchTimingsByCity).mockRejectedValue('Unknown');

			await expect(next()).rejects.toThrow('process.exit called');
		});

		it('should exit when no location available in stored config', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({});

			await expect(next()).rejects.toThrow('process.exit called');

			expect(mockExit).toHaveBeenCalledWith(1);
		});
	});

	describe('config options', () => {
		it('should use custom method', async () => {
			vi.mocked(config.get).mockImplementation((key: string) => {
				if (key === 'method') return 1;
				if (key === 'school') return 1;
				return undefined;
			});
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchTimingsByCity).mockResolvedValue(mockPrayerData);

			await next();

			expect(fetchTimingsByCity).toHaveBeenCalledWith(
				expect.objectContaining({ method: 1, school: 1 })
			);
		});
	});
});
