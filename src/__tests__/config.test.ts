import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	config,
	getLocation,
	hasLocation,
	setLocation,
	setMethod,
	setSchool,
	setTimezone,
	setFormat24h,
	getAllConfig,
	clearConfig,
} from '../config.js';

describe('config', () => {
	beforeEach(() => {
		// Clear config before each test
		clearConfig();
	});

	describe('config instance', () => {
		it('should have correct project name', () => {
			expect(config.path).toContain('azaan');
		});

		it('should have default values', () => {
			const defaults = getAllConfig();
			expect(defaults.method).toBe(2); // ISNA
			expect(defaults.school).toBe(0); // Shafi
			expect(defaults.format24h).toBe(false);
		});
	});

	describe('getLocation', () => {
		it('should return empty location when not set', () => {
			const loc = getLocation();
			expect(loc.city).toBeUndefined();
			expect(loc.country).toBeUndefined();
			expect(loc.latitude).toBeUndefined();
			expect(loc.longitude).toBeUndefined();
		});

		it('should return stored city and country', () => {
			config.set('city', 'Lahore');
			config.set('country', 'Pakistan');

			const loc = getLocation();
			expect(loc.city).toBe('Lahore');
			expect(loc.country).toBe('Pakistan');
		});

		it('should return stored coordinates', () => {
			config.set('latitude', 31.5204);
			config.set('longitude', 74.3587);

			const loc = getLocation();
			expect(loc.latitude).toBe(31.5204);
			expect(loc.longitude).toBe(74.3587);
		});
	});

	describe('hasLocation', () => {
		it('should return false when no location set', () => {
			expect(hasLocation()).toBe(false);
		});

		it('should return true when city and country are set', () => {
			config.set('city', 'Lahore');
			config.set('country', 'Pakistan');

			expect(hasLocation()).toBe(true);
		});

		it('should return true when coordinates are set', () => {
			config.set('latitude', 31.5204);
			config.set('longitude', 74.3587);

			expect(hasLocation()).toBe(true);
		});

		it('should return false with only city (no country)', () => {
			config.set('city', 'Lahore');

			expect(hasLocation()).toBe(false);
		});

		it('should return false with only latitude (no longitude)', () => {
			config.set('latitude', 31.5204);

			expect(hasLocation()).toBe(false);
		});

		it('should return true with both city/country and coords', () => {
			config.set('city', 'Lahore');
			config.set('country', 'Pakistan');
			config.set('latitude', 31.5204);
			config.set('longitude', 74.3587);

			expect(hasLocation()).toBe(true);
		});
	});

	describe('setLocation', () => {
		it('should set city and country', () => {
			setLocation({ city: 'Lahore', country: 'Pakistan' });

			expect(config.get('city')).toBe('Lahore');
			expect(config.get('country')).toBe('Pakistan');
		});

		it('should set coordinates', () => {
			setLocation({ latitude: 31.5204, longitude: 74.3587 });

			expect(config.get('latitude')).toBe(31.5204);
			expect(config.get('longitude')).toBe(74.3587);
		});

		it('should set all location fields', () => {
			setLocation({
				city: 'Lahore',
				country: 'Pakistan',
				latitude: 31.5204,
				longitude: 74.3587,
			});

			expect(config.get('city')).toBe('Lahore');
			expect(config.get('country')).toBe('Pakistan');
			expect(config.get('latitude')).toBe(31.5204);
			expect(config.get('longitude')).toBe(74.3587);
		});

		it('should not set undefined values', () => {
			setLocation({ city: 'Lahore' });

			expect(config.get('city')).toBe('Lahore');
			expect(config.get('country')).toBeUndefined();
		});

		it('should handle empty object', () => {
			setLocation({});

			expect(config.get('city')).toBeUndefined();
			expect(config.get('country')).toBeUndefined();
		});
	});

	describe('setMethod', () => {
		it('should set calculation method', () => {
			setMethod(1);
			expect(config.get('method')).toBe(1);

			setMethod(5);
			expect(config.get('method')).toBe(5);
		});

		it('should handle all valid method IDs', () => {
			const validMethods = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
			for (const method of validMethods) {
				setMethod(method);
				expect(config.get('method')).toBe(method);
			}
		});
	});

	describe('setSchool', () => {
		it('should set Shafi school (0)', () => {
			setSchool(0);
			expect(config.get('school')).toBe(0);
		});

		it('should set Hanafi school (1)', () => {
			setSchool(1);
			expect(config.get('school')).toBe(1);
		});
	});

	describe('setTimezone', () => {
		it('should set timezone', () => {
			setTimezone('Asia/Karachi');
			expect(config.get('timezone')).toBe('Asia/Karachi');
		});

		it('should set different timezones', () => {
			setTimezone('America/New_York');
			expect(config.get('timezone')).toBe('America/New_York');

			setTimezone('Europe/London');
			expect(config.get('timezone')).toBe('Europe/London');
		});
	});

	describe('setFormat24h', () => {
		it('should set 24h format to true', () => {
			setFormat24h(true);
			expect(config.get('format24h')).toBe(true);
		});

		it('should set 24h format to false', () => {
			setFormat24h(false);
			expect(config.get('format24h')).toBe(false);
		});

		it('should toggle format', () => {
			setFormat24h(true);
			expect(config.get('format24h')).toBe(true);

			setFormat24h(false);
			expect(config.get('format24h')).toBe(false);
		});
	});

	describe('getAllConfig', () => {
		it('should return all config values', () => {
			setLocation({ city: 'Lahore', country: 'Pakistan' });
			setMethod(1);
			setSchool(1);
			setTimezone('Asia/Karachi');
			setFormat24h(true);

			const allConfig = getAllConfig();

			expect(allConfig.city).toBe('Lahore');
			expect(allConfig.country).toBe('Pakistan');
			expect(allConfig.method).toBe(1);
			expect(allConfig.school).toBe(1);
			expect(allConfig.timezone).toBe('Asia/Karachi');
			expect(allConfig.format24h).toBe(true);
		});

		it('should return defaults when nothing set', () => {
			const allConfig = getAllConfig();

			expect(allConfig.method).toBe(2);
			expect(allConfig.school).toBe(0);
			expect(allConfig.format24h).toBe(false);
		});
	});

	describe('clearConfig', () => {
		it('should clear all config values', () => {
			setLocation({ city: 'Lahore', country: 'Pakistan' });
			setMethod(1);
			setSchool(1);
			setTimezone('Asia/Karachi');
			setFormat24h(true);

			clearConfig();

			const allConfig = getAllConfig();
			expect(allConfig.city).toBeUndefined();
			expect(allConfig.country).toBeUndefined();
			expect(allConfig.latitude).toBeUndefined();
			expect(allConfig.longitude).toBeUndefined();
			// Defaults are restored
			expect(allConfig.method).toBe(2);
			expect(allConfig.school).toBe(0);
			expect(allConfig.format24h).toBe(false);
		});

		it('should reset to defaults', () => {
			setMethod(1);
			clearConfig();

			expect(config.get('method')).toBe(2); // Default ISNA
		});
	});
});
