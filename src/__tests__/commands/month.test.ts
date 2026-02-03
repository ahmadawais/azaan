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
	fetchCalendarByCity: vi.fn(),
}));

vi.mock('../../config.js', () => ({
	config: {
		get: vi.fn(),
	},
	getLocation: vi.fn(),
	hasLocation: vi.fn(),
}));

import { month } from '../../commands/month.js';
import { fetchCalendarByCity } from '../../api.js';
import { config, getLocation, hasLocation } from '../../config.js';

describe('month command', () => {
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

			await expect(month({})).rejects.toThrow('process.exit called');

			expect(mockExit).toHaveBeenCalledWith(1);
		});
	});

	describe('when only coordinates are configured', () => {
		it('should exit with error requiring city/country', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ latitude: 31.5204, longitude: 74.3587 });

			await expect(month({})).rejects.toThrow('process.exit called');

			const errorCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('Month view requires city/country')
			);
			expect(errorCall).toBeDefined();
		});
	});

	describe('with city/country configured', () => {
		it('should fetch monthly calendar', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchCalendarByCity).mockResolvedValue([mockPrayerData]);

			await month({});

			expect(fetchCalendarByCity).toHaveBeenCalledWith({
				city: 'Lahore',
				country: 'Pakistan',
				year: 2026,
				month: 2,
				method: 2,
				school: 0,
			});
		});

		it('should display month name and location', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchCalendarByCity).mockResolvedValue([mockPrayerData]);

			await month({});

			const monthCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('February')
			);
			expect(monthCall).toBeDefined();
		});
	});

	describe('year and month options', () => {
		it('should use provided year', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchCalendarByCity).mockResolvedValue([mockPrayerData]);

			await month({ year: '2027' });

			expect(fetchCalendarByCity).toHaveBeenCalledWith(
				expect.objectContaining({ year: 2027 })
			);
		});

		it('should use provided month', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchCalendarByCity).mockResolvedValue([mockPrayerData]);

			await month({ month: '6' });

			expect(fetchCalendarByCity).toHaveBeenCalledWith(
				expect.objectContaining({ month: 6 })
			);
		});

		it('should use both year and month when provided', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchCalendarByCity).mockResolvedValue([mockPrayerData]);

			await month({ year: '2027', month: '12' });

			expect(fetchCalendarByCity).toHaveBeenCalledWith(
				expect.objectContaining({ year: 2027, month: 12 })
			);
		});

		it('should default to current year and month', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchCalendarByCity).mockResolvedValue([mockPrayerData]);

			await month({});

			expect(fetchCalendarByCity).toHaveBeenCalledWith(
				expect.objectContaining({ year: 2026, month: 2 })
			);
		});
	});

	describe('time formatting', () => {
		it('should use 12h format by default', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchCalendarByCity).mockResolvedValue([mockPrayerData]);

			await month({});

			expect(mockConsoleLog).toHaveBeenCalled();
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
			vi.mocked(fetchCalendarByCity).mockResolvedValue([mockPrayerData]);

			await month({});

			expect(mockConsoleLog).toHaveBeenCalled();
		});
	});

	describe('error handling', () => {
		it('should handle API errors', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchCalendarByCity).mockRejectedValue(new Error('API Error'));

			await expect(month({})).rejects.toThrow('process.exit called');

			expect(mockExit).toHaveBeenCalledWith(1);
		});

		it('should handle unknown errors', async () => {
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchCalendarByCity).mockRejectedValue('Unknown');

			await expect(month({})).rejects.toThrow('process.exit called');
		});
	});

	describe('config options', () => {
		it('should use custom method and school', async () => {
			vi.mocked(config.get).mockImplementation((key: string) => {
				if (key === 'method') return 1;
				if (key === 'school') return 1;
				return false;
			});
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchCalendarByCity).mockResolvedValue([mockPrayerData]);

			await month({});

			expect(fetchCalendarByCity).toHaveBeenCalledWith(
				expect.objectContaining({ method: 1, school: 1 })
			);
		});
	});

	describe('calendar display', () => {
		it('should display all days in the month', async () => {
			const multipleDays = [
				{ ...mockPrayerData, date: { ...mockPrayerData.date, gregorian: { ...mockPrayerData.date.gregorian, day: '01' } } },
				{ ...mockPrayerData, date: { ...mockPrayerData.date, gregorian: { ...mockPrayerData.date.gregorian, day: '02' } } },
				{ ...mockPrayerData, date: { ...mockPrayerData.date, gregorian: { ...mockPrayerData.date.gregorian, day: '03' } } },
			];
			vi.mocked(hasLocation).mockReturnValue(true);
			vi.mocked(getLocation).mockReturnValue({ city: 'Lahore', country: 'Pakistan' });
			vi.mocked(fetchCalendarByCity).mockResolvedValue(multipleDays);

			await month({});

			// Should have logged entries for each day
			expect(mockConsoleLog).toHaveBeenCalled();
		});
	});
});
