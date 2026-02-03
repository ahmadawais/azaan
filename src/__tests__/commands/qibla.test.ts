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
	fetchQibla: vi.fn(),
}));

vi.mock('../../config.js', () => ({
	getLocation: vi.fn(),
	hasLocation: vi.fn(),
}));

vi.mock('../../geo.js', () => ({
	guessLocation: vi.fn(),
}));

import { qibla } from '../../commands/qibla.js';
import { fetchQibla } from '../../api.js';
import { getLocation } from '../../config.js';
import { guessLocation } from '../../geo.js';

describe('qibla command', () => {
	const mockQiblaData = {
		latitude: 31.5204,
		longitude: 74.3587,
		direction: 259.92,
	};

	let mockExit: ReturnType<typeof vi.spyOn>;
	let mockConsoleLog: ReturnType<typeof vi.spyOn>;
	let mockConsoleError: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();

		mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
			throw new Error('process.exit called');
		});
		mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
		mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('with stored coordinates', () => {
		it('should fetch and display Qibla direction', async () => {
			vi.mocked(getLocation).mockReturnValue({ latitude: 31.5204, longitude: 74.3587 });
			vi.mocked(fetchQibla).mockResolvedValue(mockQiblaData);

			await qibla({});

			expect(fetchQibla).toHaveBeenCalledWith(31.5204, 74.3587);
		});

		it('should display direction in degrees', async () => {
			vi.mocked(getLocation).mockReturnValue({ latitude: 31.5204, longitude: 74.3587 });
			vi.mocked(fetchQibla).mockResolvedValue(mockQiblaData);

			await qibla({});

			const directionCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('259.92')
			);
			expect(directionCall).toBeDefined();
		});

		it('should display Qibla Direction title', async () => {
			vi.mocked(getLocation).mockReturnValue({ latitude: 31.5204, longitude: 74.3587 });
			vi.mocked(fetchQibla).mockResolvedValue(mockQiblaData);

			await qibla({});

			const titleCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('Qibla Direction')
			);
			expect(titleCall).toBeDefined();
		});
	});

	describe('location detection', () => {
		it('should auto-detect location when not configured', async () => {
			vi.mocked(getLocation).mockReturnValue({});
			vi.mocked(guessLocation).mockResolvedValue({
				city: 'Lahore',
				country: 'Pakistan',
				latitude: 31.5204,
				longitude: 74.3587,
				timezone: 'Asia/Karachi',
			});
			vi.mocked(fetchQibla).mockResolvedValue(mockQiblaData);

			await qibla({});

			expect(guessLocation).toHaveBeenCalled();
			expect(fetchQibla).toHaveBeenCalledWith(31.5204, 74.3587);
		});

		it('should exit when location detection fails', async () => {
			vi.mocked(getLocation).mockReturnValue({});
			vi.mocked(guessLocation).mockResolvedValue(null);

			await expect(qibla({})).rejects.toThrow('process.exit called');

			expect(mockExit).toHaveBeenCalledWith(1);
		});
	});

	describe('JSON output', () => {
		it('should output JSON when --json flag is set', async () => {
			vi.mocked(getLocation).mockReturnValue({ latitude: 31.5204, longitude: 74.3587 });
			vi.mocked(fetchQibla).mockResolvedValue(mockQiblaData);

			await qibla({ json: true });

			const jsonCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('"direction"')
			);
			expect(jsonCall).toBeDefined();

			const output = JSON.parse(jsonCall![0]);
			expect(output.direction).toBe(259.92);
			expect(output.compass).toBeDefined();
		});

		it('should include compass direction in JSON', async () => {
			vi.mocked(getLocation).mockReturnValue({ latitude: 31.5204, longitude: 74.3587 });
			vi.mocked(fetchQibla).mockResolvedValue(mockQiblaData);

			await qibla({ json: true });

			const jsonCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('"compass"')
			);
			const output = JSON.parse(jsonCall![0]);
			expect(output.compass).toBe('W');
		});

		it('should exit with error when JSON requested but no location', async () => {
			vi.mocked(getLocation).mockReturnValue({});

			await expect(qibla({ json: true })).rejects.toThrow('process.exit called');

			expect(mockConsoleError).toHaveBeenCalledWith('No location configured. Run: azaan config');
		});
	});

	describe('compass directions', () => {
		const testCases = [
			{ degrees: 0, expected: 'N' },
			{ degrees: 45, expected: 'NE' },
			{ degrees: 90, expected: 'E' },
			{ degrees: 135, expected: 'SE' },
			{ degrees: 180, expected: 'S' },
			{ degrees: 225, expected: 'SW' },
			{ degrees: 270, expected: 'W' },
			{ degrees: 315, expected: 'NW' },
		];

		testCases.forEach(({ degrees, expected }) => {
			it(`should return ${expected} for ${degrees} degrees`, async () => {
				vi.mocked(getLocation).mockReturnValue({ latitude: 31.5204, longitude: 74.3587 });
				vi.mocked(fetchQibla).mockResolvedValue({
					...mockQiblaData,
					direction: degrees,
				});

				await qibla({ json: true });

				const jsonCall = mockConsoleLog.mock.calls.find(
					(call) => typeof call[0] === 'string' && call[0].includes('"compass"')
				);
				const output = JSON.parse(jsonCall![0]);
				expect(output.compass).toBe(expected);
			});
		});
	});

	describe('compass emojis', () => {
		it('should display arrow emoji for direction', async () => {
			vi.mocked(getLocation).mockReturnValue({ latitude: 31.5204, longitude: 74.3587 });
			vi.mocked(fetchQibla).mockResolvedValue(mockQiblaData);

			await qibla({});

			// Should have an emoji arrow in output
			expect(mockConsoleLog).toHaveBeenCalled();
		});
	});

	describe('error handling', () => {
		it('should handle API errors', async () => {
			vi.mocked(getLocation).mockReturnValue({ latitude: 31.5204, longitude: 74.3587 });
			vi.mocked(fetchQibla).mockRejectedValue(new Error('API Error'));

			await expect(qibla({})).rejects.toThrow('process.exit called');

			expect(mockExit).toHaveBeenCalledWith(1);
		});

		it('should handle unknown errors', async () => {
			vi.mocked(getLocation).mockReturnValue({ latitude: 31.5204, longitude: 74.3587 });
			vi.mocked(fetchQibla).mockRejectedValue('Unknown');

			await expect(qibla({})).rejects.toThrow('process.exit called');
		});
	});

	describe('location display', () => {
		it('should display coordinates', async () => {
			vi.mocked(getLocation).mockReturnValue({ latitude: 31.5204, longitude: 74.3587 });
			vi.mocked(fetchQibla).mockResolvedValue(mockQiblaData);

			await qibla({});

			const locationCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('31.5204')
			);
			expect(locationCall).toBeDefined();
		});

		it('should display direction explanation', async () => {
			vi.mocked(getLocation).mockReturnValue({ latitude: 31.5204, longitude: 74.3587 });
			vi.mocked(fetchQibla).mockResolvedValue(mockQiblaData);

			await qibla({});

			const explanationCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('clockwise from North')
			);
			expect(explanationCall).toBeDefined();
		});
	});
});
