import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	fetchTimingsByCity,
	fetchTimingsByCoords,
	fetchNextPrayer,
	fetchCalendarByCity,
	fetchMethods,
	fetchQibla,
} from '../api.js';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('api', () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

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
			method: { id: 1, name: 'University of Islamic Sciences, Karachi' },
			school: { id: 1, name: 'Hanafi' },
		},
	};

	describe('fetchTimingsByCity', () => {
		it('should fetch prayer times by city successfully', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 200, status: 'OK', data: mockPrayerData }),
			});

			const result = await fetchTimingsByCity({
				city: 'Lahore',
				country: 'Pakistan',
			});

			expect(result).toEqual(mockPrayerData);
			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockFetch.mock.calls[0][0]).toContain('timingsByCity');
			expect(mockFetch.mock.calls[0][0]).toContain('city=Lahore');
			expect(mockFetch.mock.calls[0][0]).toContain('country=Pakistan');
		});

		it('should include method and school params when provided', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 200, status: 'OK', data: mockPrayerData }),
			});

			await fetchTimingsByCity({
				city: 'Lahore',
				country: 'Pakistan',
				method: 1,
				school: 1,
			});

			expect(mockFetch.mock.calls[0][0]).toContain('method=1');
			expect(mockFetch.mock.calls[0][0]).toContain('school=1');
		});

		it('should use provided date', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 200, status: 'OK', data: mockPrayerData }),
			});

			const date = new Date('2026-03-15');
			await fetchTimingsByCity({
				city: 'Lahore',
				country: 'Pakistan',
				date,
			});

			expect(mockFetch.mock.calls[0][0]).toContain('15-03-2026');
		});

		it('should throw on API error', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 400, status: 'Invalid city' }),
			});

			await expect(fetchTimingsByCity({
				city: 'InvalidCity',
				country: 'Country',
			})).rejects.toThrow('Invalid city');
		});
	});

	describe('fetchTimingsByCoords', () => {
		it('should fetch prayer times by coordinates successfully', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 200, status: 'OK', data: mockPrayerData }),
			});

			const result = await fetchTimingsByCoords({
				latitude: 31.5204,
				longitude: 74.3587,
			});

			expect(result).toEqual(mockPrayerData);
			expect(mockFetch.mock.calls[0][0]).toContain('latitude=31.5204');
			expect(mockFetch.mock.calls[0][0]).toContain('longitude=74.3587');
		});

		it('should include timezone when provided', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 200, status: 'OK', data: mockPrayerData }),
			});

			await fetchTimingsByCoords({
				latitude: 31.5204,
				longitude: 74.3587,
				timezone: 'Asia/Karachi',
			});

			expect(mockFetch.mock.calls[0][0]).toContain('timezonestring=Asia%2FKarachi');
		});

		it('should include method and school params', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 200, status: 'OK', data: mockPrayerData }),
			});

			await fetchTimingsByCoords({
				latitude: 31.5204,
				longitude: 74.3587,
				method: 2,
				school: 0,
			});

			expect(mockFetch.mock.calls[0][0]).toContain('method=2');
			expect(mockFetch.mock.calls[0][0]).toContain('school=0');
		});

		it('should throw on API error', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 400, status: 'Invalid coordinates' }),
			});

			await expect(fetchTimingsByCoords({
				latitude: 999,
				longitude: 999,
			})).rejects.toThrow('Invalid coordinates');
		});
	});

	describe('fetchNextPrayer', () => {
		const mockNextPrayerData = {
			...mockPrayerData,
			nextPrayer: 'Dhuhr',
			nextPrayerTime: '12:30',
		};

		it('should fetch next prayer successfully', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 200, status: 'OK', data: mockNextPrayerData }),
			});

			const result = await fetchNextPrayer({
				latitude: 31.5204,
				longitude: 74.3587,
			});

			expect(result.nextPrayer).toBe('Dhuhr');
			expect(result.nextPrayerTime).toBe('12:30');
		});

		it('should include optional params', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 200, status: 'OK', data: mockNextPrayerData }),
			});

			await fetchNextPrayer({
				latitude: 31.5204,
				longitude: 74.3587,
				method: 1,
				school: 1,
				timezone: 'Asia/Karachi',
			});

			expect(mockFetch.mock.calls[0][0]).toContain('method=1');
			expect(mockFetch.mock.calls[0][0]).toContain('school=1');
			expect(mockFetch.mock.calls[0][0]).toContain('timezonestring=');
		});

		it('should throw on API error', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 500, status: 'Server error' }),
			});

			await expect(fetchNextPrayer({
				latitude: 31.5204,
				longitude: 74.3587,
			})).rejects.toThrow('Server error');
		});
	});

	describe('fetchCalendarByCity', () => {
		it('should fetch monthly calendar with month param', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 200, status: 'OK', data: [mockPrayerData] }),
			});

			const result = await fetchCalendarByCity({
				city: 'Lahore',
				country: 'Pakistan',
				year: 2026,
				month: 2,
			});

			expect(result).toHaveLength(1);
			expect(mockFetch.mock.calls[0][0]).toContain('calendarByCity/2026/2');
		});

		it('should fetch yearly calendar without month param', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 200, status: 'OK', data: [mockPrayerData] }),
			});

			await fetchCalendarByCity({
				city: 'Lahore',
				country: 'Pakistan',
				year: 2026,
			});

			expect(mockFetch.mock.calls[0][0]).toContain('calendarByCity/2026?');
		});

		it('should include method and school params', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 200, status: 'OK', data: [mockPrayerData] }),
			});

			await fetchCalendarByCity({
				city: 'Lahore',
				country: 'Pakistan',
				year: 2026,
				month: 2,
				method: 1,
				school: 1,
			});

			expect(mockFetch.mock.calls[0][0]).toContain('method=1');
			expect(mockFetch.mock.calls[0][0]).toContain('school=1');
		});

		it('should throw on API error', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 400, status: 'Invalid params' }),
			});

			await expect(fetchCalendarByCity({
				city: 'Lahore',
				country: 'Pakistan',
				year: 2026,
			})).rejects.toThrow('Invalid params');
		});
	});

	describe('fetchMethods', () => {
		const mockMethodsData = {
			'0': { id: 0, name: 'Jafari', params: { Fajr: 16, Isha: 14 } },
			'1': { id: 1, name: 'Karachi', params: { Fajr: 18, Isha: 18 } },
			'2': { id: 2, name: 'ISNA', params: { Fajr: 15, Isha: 15 } },
		};

		it('should fetch calculation methods successfully', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 200, status: 'OK', data: mockMethodsData }),
			});

			const result = await fetchMethods();

			expect(result['0'].name).toBe('Jafari');
			expect(result['1'].name).toBe('Karachi');
			expect(result['2'].name).toBe('ISNA');
		});

		it('should throw on API error', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 500, status: 'Server error' }),
			});

			await expect(fetchMethods()).rejects.toThrow('Server error');
		});
	});

	describe('fetchQibla', () => {
		const mockQiblaData = {
			latitude: 31.5204,
			longitude: 74.3587,
			direction: 259.92,
		};

		it('should fetch Qibla direction successfully', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 200, status: 'OK', data: mockQiblaData }),
			});

			const result = await fetchQibla(31.5204, 74.3587);

			expect(result.direction).toBe(259.92);
			expect(mockFetch.mock.calls[0][0]).toContain('qibla/31.5204/74.3587');
		});

		it('should throw on API error', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ code: 400, status: 'Invalid coordinates' }),
			});

			await expect(fetchQibla(999, 999)).rejects.toThrow('Invalid coordinates');
		});
	});
});
