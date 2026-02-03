import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reset } from '../../commands/reset.js';

// Mock dependencies
vi.mock('../../config.js', () => ({
	clearConfig: vi.fn(),
}));

vi.mock('@clack/prompts', () => ({
	confirm: vi.fn(),
	isCancel: vi.fn(),
}));

import { clearConfig } from '../../config.js';
import * as p from '@clack/prompts';

describe('reset command', () => {
	let mockConsoleLog: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('confirmation prompt', () => {
		it('should ask for confirmation before reset', async () => {
			vi.mocked(p.confirm).mockResolvedValue(false);
			vi.mocked(p.isCancel).mockReturnValue(false);

			await reset();

			expect(p.confirm).toHaveBeenCalledWith({
				message: 'Are you sure you want to reset all settings?',
				initialValue: false,
			});
		});
	});

	describe('when user confirms', () => {
		it('should clear all config', async () => {
			vi.mocked(p.confirm).mockResolvedValue(true);
			vi.mocked(p.isCancel).mockReturnValue(false);

			await reset();

			expect(clearConfig).toHaveBeenCalled();
		});

		it('should display success message', async () => {
			vi.mocked(p.confirm).mockResolvedValue(true);
			vi.mocked(p.isCancel).mockReturnValue(false);

			await reset();

			const successCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('reset to defaults')
			);
			expect(successCall).toBeDefined();
		});

		it('should display reconfigure instruction', async () => {
			vi.mocked(p.confirm).mockResolvedValue(true);
			vi.mocked(p.isCancel).mockReturnValue(false);

			await reset();

			const instructionCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('azaan')
			);
			expect(instructionCall).toBeDefined();
		});
	});

	describe('when user declines', () => {
		it('should not clear config', async () => {
			vi.mocked(p.confirm).mockResolvedValue(false);
			vi.mocked(p.isCancel).mockReturnValue(false);

			await reset();

			expect(clearConfig).not.toHaveBeenCalled();
		});

		it('should display cancelled message', async () => {
			vi.mocked(p.confirm).mockResolvedValue(false);
			vi.mocked(p.isCancel).mockReturnValue(false);

			await reset();

			const cancelledCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('Reset cancelled')
			);
			expect(cancelledCall).toBeDefined();
		});
	});

	describe('when user cancels (Ctrl+C)', () => {
		it('should not clear config', async () => {
			vi.mocked(p.confirm).mockResolvedValue(Symbol.for('cancel') as any);
			vi.mocked(p.isCancel).mockReturnValue(true);

			await reset();

			expect(clearConfig).not.toHaveBeenCalled();
		});

		it('should display cancelled message', async () => {
			vi.mocked(p.confirm).mockResolvedValue(Symbol.for('cancel') as any);
			vi.mocked(p.isCancel).mockReturnValue(true);

			await reset();

			const cancelledCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('Reset cancelled')
			);
			expect(cancelledCall).toBeDefined();
		});
	});

	describe('banner display', () => {
		it('should display banner', async () => {
			vi.mocked(p.confirm).mockResolvedValue(false);
			vi.mocked(p.isCancel).mockReturnValue(false);

			await reset();

			// Banner contains AZAAN
			const bannerCall = mockConsoleLog.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('AZAAN')
			);
			expect(bannerCall).toBeDefined();
		});
	});
});
