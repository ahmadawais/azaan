import * as p from '@clack/prompts';
import pc from 'picocolors';
import {clearConfig} from '../config.js';
import {banner} from '../utils.js';

export const reset = async (): Promise<void> => {
	console.log(banner);

	const confirm = await p.confirm({
		message: 'Are you sure you want to reset all settings?',
		initialValue: false,
	});

	if (p.isCancel(confirm) || !confirm) {
		console.log(pc.dim('  Reset cancelled.'));
		console.log('');
		return;
	}

	clearConfig();
	console.log(pc.green('  All settings have been reset to defaults.'));
	console.log(pc.dim('  Run `azaan` to reconfigure.'));
	console.log('');
};
