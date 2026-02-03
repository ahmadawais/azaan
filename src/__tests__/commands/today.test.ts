import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mock functions that can be tracked
const mockSpinnerStart = vi.fn().mockReturnThis();
const mockSpinnerStop = vi.fn().mockReturnThis();
const mockSpinnerFail = vi.fn().mockReturnThis();

// Mock ora before importing modules
vi.mock('ora', () => ({
	default: () => ({
		start: mockSpinnerStart,
		stop: mockSpinnerStop,
		fail: mockSpinnerFail,
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
	setLocation: vi.fn(),
}));

vi.mock('../../prompts.js', () => ({
	promptLocation: vi.fn(),
}));

import { today } from '../../commands/today.js';
import { fetchTimingsByCity, fetchTimingsByCoords } from '../../api.js';
import { config, getLocation, hasLocation, setLocation } from '../../config.js';
import { promptLocation } from '../../prompts.js';

describe('today command', () => {
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
	let mockConsoleError: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-02-01T10:00:00'));

		mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
			throw new Error('process.exit called');
		});
		mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
		mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

		// Default mocks
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

	describe('with city/country options', () => {
		it('should fetch prayer times by city when city and country provided', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({});
			vi.mocked(fetchTimingsByCity).mockResolvedValue(mockPrayerData);

			await today({ city: 'Lahore', country: 'Pakistan' });

			expect(fetchTimingsByCity).toHaveBeenCalledWith({
				city: 'Lahore',
				country: 'Pakistan',
				method: 2,
				school: 0,
			});
		});
	});

	describe('with coordinate options', () => {
		it('should fetch prayer times by coordinates when lat/lon provided', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({});
			vi.mocked(fetchTimingsByCoords).mockResolvedValue(mockPrayerData);

			await today({ latitude: '31.5204', longitude: '74.3587' });

			expect(fetchTimingsByCoords).toHaveBeenCalledWith({
				latitude: 31.5204,
				longitude: 74.3587,
				method: 2,
				school: 0,
				timezone: undefined,
			});
		});
	});

	describe('with stored location', () => {
		it('should use stored city/country when no options provided', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchTimingsByCity).mockResolvedValue(mockPrayerData);

			await today({});

			expect(fetchTimingsByCity).toHaveBeenCalledWith({
				city: 'Lahore',
				country: 'Pakistan',
				method: 2,
				school: 0,
			});
		});

		it('should use stored coordinates when no options provided', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ latitude: 31.5204, longitude: 74.3587 });
			vi.mocked(fetchTimingsByCoords).mockResolvedValue(mockPrayerData);

			await today({});

			expect(fetchTimingsByCoords).toHaveBeenCalledWith({
				latitude: 31.5204,
				longitude: 74.3587,
				method: 2,
				school: 0,
				timezone: undefined,
			});
		});
	});

	describe('JSON output', () => {
		it('should output JSON format when --json flag is set', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchTimingsByCity).mockResolvedValue(mockPrayerData);

			await today({ json: true });

			const jsonCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('"location"')
			);
			expect(jsonCall).toBeDefined();

			const output = JSON.parse(jsonCall![0]);
			expect(output.location.city).toBe('Lahore');
			expect(output.location.country).toBe('Pakistan');
			expect(output.timings.fajr).toBe('05:30');
		});

		it('should exit with error when JSON requested but no location', async () => {
			vi.mocked(hasLocation).mockReturnValue(false);

			await expect(today({ json: true })).rejects.toThrow('process.exit called');

			expect(mockConsoleError).toHaveBeenCalledWith('No location configured. Run: azaan config');
		});
	});

	describe('status output', () => {
		it('should output single line status when --status flag is set', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchTimingsByCity).mockResolvedValue(mockPrayerData);

			await today({ status: true });

			const statusCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('Dhuhr')
			);
			expect(statusCall).toBeDefined();
		});

		it('should exit with error when status requested but no location', async () => {
			vi.mocked(hasLocation).mockReturnValue(false);

			await expect(today({ status: true })).rejects.toThrow('process.exit called');
		});
	});

	describe('plain output', () => {
		it('should use plain banner when --plain flag is set', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchTimingsByCity).mockResolvedValue(mockPrayerData);

			await today({ plain: true });

			expect(mockConsoleLog).toHaveBeenCalled();
		});
	});

	describe('interactive setup', () => {
		it('should prompt for location when not configured', async () => {
			vi.mocked(hasLocation).mockReturnValue(false);
			vi.mocked(promptLocation).mockResolvedValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchTimingsByCity).mockResolvedValue(mockPrayerData);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });

			await today({});

			expect(promptLocation).toHaveBeenCalled();
			expect(setLocation).toHaveBeenCalledWith({ city: 'Lahore', country: 'Pakistan' });
		});

		it('should exit when user cancels location prompt', async () => {
			vi.mocked(hasLocation).mockReturnValue(false);
			vi.mocked(promptLocation).mockResolvedValue(null);

			await expect(today({})).rejects.toThrow('process.exit called');

			expect(mockExit).toHaveBeenCalledWith(0);
		});
	});

	describe('error handling', () => {
		it('should handle API errors gracefully', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'InvalidCity', country: 'Country' });
			vi.mocked(fetchTimingsByCity).mockRejectedValue(new Error('City not found'));

			await expect(today({})).rejects.toThrow('process.exit called');

			expect(mockExit).toHaveBeenCalledWith(1);
		});

		it('should handle unknown errors', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchTimingsByCity).mockRejectedValue('Unknown error');

			await expect(today({})).rejects.toThrow('process.exit called');
		});
	});

	describe('config options', () => {
		it('should use custom method from config', async () => {
			vi.mocked(config.get).mockImplementation((key: string) => {
				if (key === 'method') return 1;
				if (key === 'school') return 1;
				return undefined;
			});
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchTimingsByCity).mockResolvedValue(mockPrayerData);

			await today({});

			expect(fetchTimingsByCity).toHaveBeenCalledWith(
				expect.objectContaining({ method: 1, school: 1 })
			);
		});

		it('should use custom timezone from config', async () => {
			vi.mocked(config.get).mockImplementation((key: string) => {
				if (key === 'timezone') return 'Asia/Karachi';
				if (key === 'method') return 2;
				if (key === 'school') return 0;
				return undefined;
			});
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ latitude: 31.5204, longitude: 74.3587 });
			vi.mocked(fetchTimingsByCoords).mockResolvedValue(mockPrayerData);

			await today({});

			expect(fetchTimingsByCoords).toHaveBeenCalledWith(
				expect.objectContaining({ timezone: 'Asia/Karachi' })
			);
		});

		it('should use 24h format from config', async () => {
			vi.mocked(config.get).mockImplementation((key: string) => {
				if (key === 'format24h') return true;
				if (key === 'method') return 2;
				if (key === 'school') return 0;
				return undefined;
			});
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchTimingsByCity).mockResolvedValue(mockPrayerData);

			await today({ status: true });

			// Status output should use 24h format
			expect(mockConsoleLog).toHaveBeenCalled();
		});
	});
});
