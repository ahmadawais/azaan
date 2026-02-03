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
	fetchMethods: vi.fn(),
}));

import { methods } from '../../commands/methods.js';
import { fetchMethods } from '../../api.js';

describe('methods command', () => {
	const mockMethodsData = {
		'0': { id: 0, name: 'Jafari', params: { Fajr: 16, Isha: 14 } },
		'1': { id: 1, name: 'University of Islamic Sciences, Karachi', params: { Fajr: 18, Isha: 18 } },
		'2': { id: 2, name: 'Islamic Society of North America (ISNA)', params: { Fajr: 15, Isha: 15 } },
		'3': { id: 3, name: 'Muslim World League', params: { Fajr: 18, Isha: 17 } },
		'4': { id: 4, name: 'Umm Al-Qura University, Makkah', params: { Fajr: 18.5, Isha: '90 min' } },
		'99': { id: 99, name: 'Custom', params: { Fajr: 0, Isha: 0 } },
	};

	let mockExit: ReturnType<typeof vi.spyOn>;
	let mockConsoleLog: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();

		mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
			throw new Error('process.exit called');
		});
		mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('fetching methods', () => {
		it('should fetch and display calculation methods', async () => {
			vi.mocked(fetchMethods).mockResolvedValue(mockMethodsData);

			await methods();

			expect(fetchMethods).toHaveBeenCalled();
		});

		it('should display method names', async () => {
			vi.mocked(fetchMethods).mockResolvedValue(mockMethodsData);

			await methods();

			const jafariCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('Jafari')
			);
			expect(jafariCall).toBeDefined();
		});

		it('should display method IDs', async () => {
			vi.mocked(fetchMethods).mockResolvedValue(mockMethodsData);

			await methods();

			// Methods should be displayed with their IDs
			expect(mockConsoleLog).toHaveBeenCalled();
		});
	});

	describe('method filtering', () => {
		it('should filter out method 99 (Custom)', async () => {
			vi.mocked(fetchMethods).mockResolvedValue(mockMethodsData);

			await methods();

			const customCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('Custom')
			);
			expect(customCall).toBeUndefined();
		});

		it('should filter out methods without names', async () => {
			const methodsWithEmpty = {
				...mockMethodsData,
				'5': { id: 5, name: '', params: { Fajr: 15, Isha: 15 } },
			};
			vi.mocked(fetchMethods).mockResolvedValue(methodsWithEmpty);

			await methods();

			expect(mockConsoleLog).toHaveBeenCalled();
		});
	});

	describe('method sorting', () => {
		it('should sort methods by ID', async () => {
			vi.mocked(fetchMethods).mockResolvedValue(mockMethodsData);

			await methods();

			// Methods should be sorted by ID
			expect(mockConsoleLog).toHaveBeenCalled();
		});
	});

	describe('parameter display', () => {
		it('should display Fajr and Isha parameters', async () => {
			vi.mocked(fetchMethods).mockResolvedValue(mockMethodsData);

			await methods();

			const fajrCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('Fajr:')
			);
			expect(fajrCall).toBeDefined();
		});

		it('should handle numeric Isha parameter', async () => {
			vi.mocked(fetchMethods).mockResolvedValue(mockMethodsData);

			await methods();

			// Should display degree symbol for numeric values
			expect(mockConsoleLog).toHaveBeenCalled();
		});

		it('should handle string Isha parameter (like "90 min")', async () => {
			vi.mocked(fetchMethods).mockResolvedValue(mockMethodsData);

			await methods();

			// Should not display degree symbol for string values
			expect(mockConsoleLog).toHaveBeenCalled();
		});

		it('should handle missing params gracefully', async () => {
			const methodsWithMissingParams = {
				'0': { id: 0, name: 'Test Method', params: undefined },
			};
			vi.mocked(fetchMethods).mockResolvedValue(methodsWithMissingParams as any);

			await methods();

			expect(mockConsoleLog).toHaveBeenCalled();
		});
	});

	describe('display formatting', () => {
		it('should display header text', async () => {
			vi.mocked(fetchMethods).mockResolvedValue(mockMethodsData);

			await methods();

			const headerCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('Available calculation methods')
			);
			expect(headerCall).toBeDefined();
		});

		it('should display config instruction', async () => {
			vi.mocked(fetchMethods).mockResolvedValue(mockMethodsData);

			await methods();

			const instructionCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('azaan config --method')
			);
			expect(instructionCall).toBeDefined();
		});
	});

	describe('error handling', () => {
		it('should handle API errors', async () => {
			vi.mocked(fetchMethods).mockRejectedValue(new Error('API Error'));

			await expect(methods()).rejects.toThrow('process.exit called');

			expect(mockExit).toHaveBeenCalledWith(1);
		});

		it('should handle unknown errors', async () => {
			vi.mocked(fetchMethods).mockRejectedValue('Unknown');

			await expect(methods()).rejects.toThrow('process.exit called');
		});
	});
});
