import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { guessLocation } from '../geo.js';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('geo', () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('guessLocation', () => {
		const mockIpApiResponse = {
			city: 'Lahore',
			country: 'Pakistan',
			lat: 31.5204,
			lon: 74.3587,
			timezone: 'Asia/Karachi',
		};

		const mockIpapiCoResponse = {
			city: 'Lahore',
			country_name: 'Pakistan',
			latitude: 31.5204,
			longitude: 74.3587,
			timezone: 'Asia/Karachi',
		};

		const mockIpWhoisResponse = {
			success: true,
			city: 'Lahore',
			country: 'Pakistan',
			latitude: 31.5204,
			longitude: 74.3587,
			timezone: { id: 'Asia/Karachi' },
		};

		it('should return location from ip-api.com on success', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve(mockIpApiResponse),
			});

			const result = await guessLocation();

			expect(result).toEqual({
				city: 'Lahore',
				country: 'Pakistan',
				latitude: 31.5204,
				longitude: 74.3587,
				timezone: 'Asia/Karachi',
			});
			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockFetch.mock.calls[0][0]).toContain('ip-api.com');
		});

		it('should fallback to ipapi.co when ip-api.com fails', async () => {
			// First call (ip-api.com) fails
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({}),
			});
			// Second call (ipapi.co) succeeds
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve(mockIpapiCoResponse),
			});

			const result = await guessLocation();

			expect(result).toEqual({
				city: 'Lahore',
				country: 'Pakistan',
				latitude: 31.5204,
				longitude: 74.3587,
				timezone: 'Asia/Karachi',
			});
			expect(mockFetch).toHaveBeenCalledTimes(2);
		});

		it('should fallback to ipwho.is when both ip-api.com and ipapi.co fail', async () => {
			// First call (ip-api.com) fails
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({}),
			});
			// Second call (ipapi.co) fails
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({}),
			});
			// Third call (ipwho.is) succeeds
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve(mockIpWhoisResponse),
			});

			const result = await guessLocation();

			expect(result).toEqual({
				city: 'Lahore',
				country: 'Pakistan',
				latitude: 31.5204,
				longitude: 74.3587,
				timezone: 'Asia/Karachi',
			});
			expect(mockFetch).toHaveBeenCalledTimes(3);
		});

		it('should return null when all providers fail', async () => {
			mockFetch.mockResolvedValue({
				json: () => Promise.resolve({}),
			});

			const result = await guessLocation();

			expect(result).toBeNull();
			expect(mockFetch).toHaveBeenCalledTimes(3);
		});

		it('should handle network errors gracefully', async () => {
			mockFetch.mockRejectedValue(new Error('Network error'));

			const result = await guessLocation();

			expect(result).toBeNull();
		});

		it('should handle missing city in ip-api response', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ country: 'Pakistan', lat: 31.5, lon: 74.3 }),
			});
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve(mockIpapiCoResponse),
			});

			const result = await guessLocation();

			expect(result?.city).toBe('Lahore');
		});

		it('should handle missing country in ip-api response', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ city: 'Lahore', lat: 31.5, lon: 74.3 }),
			});
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve(mockIpapiCoResponse),
			});

			const result = await guessLocation();

			expect(result?.country).toBe('Pakistan');
		});

		it('should handle missing lat in ip-api response', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ city: 'Lahore', country: 'Pakistan', lon: 74.3 }),
			});
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve(mockIpapiCoResponse),
			});

			const result = await guessLocation();

			expect(result?.latitude).toBe(31.5204);
		});

		it('should handle missing lon in ip-api response', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ city: 'Lahore', country: 'Pakistan', lat: 31.5 }),
			});
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve(mockIpapiCoResponse),
			});

			const result = await guessLocation();

			expect(result?.longitude).toBe(74.3587);
		});

		it('should handle missing timezone with empty string fallback', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({
					city: 'Lahore',
					country: 'Pakistan',
					lat: 31.5204,
					lon: 74.3587,
					// No timezone
				}),
			});

			const result = await guessLocation();

			expect(result?.timezone).toBe('');
		});

		it('should handle ipapi.co with missing country_name', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({}),
			});
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ city: 'Lahore', latitude: 31.5, longitude: 74.3 }),
			});
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve(mockIpWhoisResponse),
			});

			const result = await guessLocation();

			expect(result?.country).toBe('Pakistan');
		});

		it('should handle ipwho.is with success=false', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({}),
			});
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({}),
			});
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({ success: false, city: 'Lahore', country: 'Pakistan' }),
			});

			const result = await guessLocation();

			expect(result).toBeNull();
		});

		it('should handle ipwho.is with missing timezone id', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({}),
			});
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({}),
			});
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({
					success: true,
					city: 'Lahore',
					country: 'Pakistan',
					latitude: 31.5204,
					longitude: 74.3587,
					timezone: {}, // No id
				}),
			});

			const result = await guessLocation();

			expect(result?.timezone).toBe('');
		});

		it('should handle fetch throwing error for ip-api.com', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Connection refused'));
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve(mockIpapiCoResponse),
			});

			const result = await guessLocation();

			expect(result?.city).toBe('Lahore');
		});

		it('should handle fetch throwing error for ipapi.co', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({}),
			});
			mockFetch.mockRejectedValueOnce(new Error('Timeout'));
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve(mockIpWhoisResponse),
			});

			const result = await guessLocation();

			expect(result?.city).toBe('Lahore');
		});

		it('should handle fetch throwing error for ipwho.is', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({}),
			});
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({}),
			});
			mockFetch.mockRejectedValueOnce(new Error('DNS error'));

			const result = await guessLocation();

			expect(result).toBeNull();
		});

		it('should handle JSON parse error', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.reject(new Error('Invalid JSON')),
			});
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve(mockIpapiCoResponse),
			});

			const result = await guessLocation();

			expect(result?.city).toBe('Lahore');
		});

		it('should handle zero coordinates correctly', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({
					city: 'Gulf of Guinea',
					country: 'International Waters',
					lat: 0,
					lon: 0,
					timezone: 'UTC',
				}),
			});

			const result = await guessLocation();

			expect(result).toEqual({
				city: 'Gulf of Guinea',
				country: 'International Waters',
				latitude: 0,
				longitude: 0,
				timezone: 'UTC',
			});
		});

		it('should handle negative coordinates correctly', async () => {
			mockFetch.mockResolvedValueOnce({
				json: () => Promise.resolve({
					city: 'Sydney',
					country: 'Australia',
					lat: -33.8688,
					lon: 151.2093,
					timezone: 'Australia/Sydney',
				}),
			});

			const result = await guessLocation();

			expect(result?.latitude).toBe(-33.8688);
			expect(result?.longitude).toBe(151.2093);
		});
	});
});
