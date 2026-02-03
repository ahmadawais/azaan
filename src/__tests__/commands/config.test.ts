import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies before importing
vi.mock('../../config.js', () => ({
	config: {
		path: '/mock/path/config.json',
	},
	setLocation: vi.fn(),
	setMethod: vi.fn(),
	setSchool: vi.fn(),
	setTimezone: vi.fn(),
	setFormat24h: vi.fn(),
	getAllConfig: vi.fn(),
	clearConfig: vi.fn(),
}));

vi.mock('../../geo.js', () => ({
	guessLocation: vi.fn(),
}));

vi.mock('@clack/prompts', () => ({
	intro: vi.fn(),
	outro: vi.fn(),
	select: vi.fn(),
	text: vi.fn(),
	confirm: vi.fn(),
	spinner: () => ({
		start: vi.fn().mockReturnThis(),
		stop: vi.fn().mockReturnThis(),
		message: vi.fn().mockReturnThis(),
	}),
	isCancel: vi.fn(),
	cancel: vi.fn(),
}));

import { configCommand } from '../../commands/config.js';
import {
	config,
	setLocation,
	setMethod,
	setSchool,
	setTimezone,
	setFormat24h,
	getAllConfig,
	clearConfig,
} from '../../config.js';
import { guessLocation } from '../../geo.js';
import * as p from '@clack/prompts';

describe('config command', () => {
	let mockExit: ReturnType<typeof vi.spyOn>;
	let mockConsoleLog: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();

		mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
			throw new Error('process.exit called');
		});
		mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

		vi.mocked(getAllConfig).mockReturnValue({
			city: 'Lahore',
			country: 'Pakistan',
			method: 1,
			school: 1,
			timezone: 'Asia/Karachi',
			format24h: false,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('--path flag', () => {
		it('should display config file path', async () => {
			await configCommand({ path: true });

			const pathCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('Config path')
			);
			expect(pathCall).toBeDefined();
		});
	});

	describe('--clear flag', () => {
		it('should clear all configuration', async () => {
			await configCommand({ clear: true });

			expect(clearConfig).toHaveBeenCalled();
		});

		it('should display success message', async () => {
			await configCommand({ clear: true });

			const successCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('Config cleared')
			);
			expect(successCall).toBeDefined();
		});
	});

	describe('--show flag', () => {
		it('should display current configuration', async () => {
			await configCommand({ show: true });

			const cityCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('Lahore')
			);
			expect(cityCall).toBeDefined();
		});

		it('should display all config fields', async () => {
			await configCommand({ show: true });

			expect(mockConsoleLog).toHaveBeenCalled();
		});

		it('should display method value', async () => {
			await configCommand({ show: true });

			const methodCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('Method')
			);
			expect(methodCall).toBeDefined();
		});

		it('should display school name', async () => {
			await configCommand({ show: true });

			const schoolCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('Hanafi')
			);
			expect(schoolCall).toBeDefined();
		});

		it('should display Shafi when school is 0', async () => {
			vi.mocked(getAllConfig).mockReturnValue({
				method: 2,
				school: 0,
				format24h: false,
			});

			await configCommand({ show: true });

			const schoolCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('Shafi')
			);
			expect(schoolCall).toBeDefined();
		});

		it('should display 24h format setting', async () => {
			vi.mocked(getAllConfig).mockReturnValue({
				method: 2,
				school: 0,
				format24h: true,
			});

			await configCommand({ show: true });

			const formatCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('24h')
			);
			expect(formatCall).toBeDefined();
		});
	});

	describe('flag-based configuration', () => {
		describe('location settings', () => {
			it('should set city and country', async () => {
				await configCommand({ city: 'Lahore', country: 'Pakistan' });

				expect(setLocation).toHaveBeenCalledWith({
					city: 'Lahore',
					country: 'Pakistan',
					latitude: undefined,
					longitude: undefined,
				});
			});

			it('should set coordinates', async () => {
				await configCommand({ latitude: '31.5204', longitude: '74.3587' });

				expect(setLocation).toHaveBeenCalledWith({
					city: undefined,
					country: undefined,
					latitude: 31.5204,
					longitude: 74.3587,
				});
			});

			it('should set both city/country and coordinates', async () => {
				await configCommand({
					city: 'Lahore',
					country: 'Pakistan',
					latitude: '31.5204',
					longitude: '74.3587',
				});

				expect(setLocation).toHaveBeenCalledWith({
					city: 'Lahore',
					country: 'Pakistan',
					latitude: 31.5204,
					longitude: 74.3587,
				});
			});
		});

		describe('method setting', () => {
			it('should set calculation method', async () => {
				await configCommand({ method: '1' });

				expect(setMethod).toHaveBeenCalledWith(1);
			});

			it('should parse method as integer', async () => {
				await configCommand({ method: '15' });

				expect(setMethod).toHaveBeenCalledWith(15);
			});
		});

		describe('school setting', () => {
			it('should set Shafi school (0)', async () => {
				await configCommand({ school: '0' });

				expect(setSchool).toHaveBeenCalledWith(0);
			});

			it('should set Hanafi school (1)', async () => {
				await configCommand({ school: '1' });

				expect(setSchool).toHaveBeenCalledWith(1);
			});
		});

		describe('timezone setting', () => {
			it('should set timezone', async () => {
				await configCommand({ timezone: 'Asia/Karachi' });

				expect(setTimezone).toHaveBeenCalledWith('Asia/Karachi');
			});
		});

		describe('format setting', () => {
			it('should set 24h format', async () => {
				await configCommand({ format24h: true });

				expect(setFormat24h).toHaveBeenCalledWith(true);
			});

			it('should set 12h format', async () => {
				await configCommand({ format24h: false });

				expect(setFormat24h).toHaveBeenCalledWith(false);
			});
		});

		it('should display success message after flag-based config', async () => {
			await configCommand({ city: 'Lahore' });

			const successCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('Configuration updated')
			);
			expect(successCall).toBeDefined();
		});
	});

	describe('interactive configuration', () => {
		it('should launch interactive mode when no flags provided', async () => {
			vi.mocked(guessLocation).mockResolvedValue(null);
			vi.mocked(p.select).mockResolvedValue('city');
			vi.mocked(p.text).mockResolvedValue('Lahore');
			vi.mocked(p.confirm).mockResolvedValue(false);
			vi.mocked(p.isCancel).mockReturnValue(false);

			await configCommand({});

			expect(p.intro).toHaveBeenCalled();
		});

		it('should handle user cancellation', async () => {
			vi.mocked(guessLocation).mockResolvedValue(null);
			vi.mocked(p.select).mockResolvedValue('city');
			vi.mocked(p.isCancel).mockReturnValue(true);

			await expect(configCommand({})).rejects.toThrow('process.exit called');
		});

		it('should try to guess location when not configured', async () => {
			vi.mocked(getAllConfig).mockReturnValue({
				method: 2,
				school: 0,
				format24h: false,
			});
			vi.mocked(guessLocation).mockResolvedValue({
				city: 'Lahore',
				country: 'Pakistan',
				latitude: 31.5204,
				longitude: 74.3587,
				timezone: 'Asia/Karachi',
			});
			vi.mocked(p.select).mockResolvedValue('city');
			vi.mocked(p.text).mockResolvedValue('Lahore');
			vi.mocked(p.confirm).mockResolvedValue(false);
			vi.mocked(p.isCancel).mockReturnValue(false);

			await configCommand({});

			expect(guessLocation).toHaveBeenCalled();
		});
	});
});
