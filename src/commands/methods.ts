import ora from 'ora';
import pc from 'picocolors';
import {fetchMethods} from '../api.js';
import {banner} from '../utils.js';

export const methods = async (): Promise<void> => {
	const spinner = ora({text: 'Fetching methods...', stream: process.stdout}).start();

	try {
		const data = await fetchMethods();

		spinner.stop();
		console.log(banner);
		console.log(pc.dim('  Available calculation methods:'));
		console.log('');

		const sorted = Object.entries(data)
			.filter(([, m]) => m.name && m.id !== 99)
			.sort((a, b) => a[1].id - b[1].id);

		for (const [, method] of sorted) {
			const fajr = method.params?.Fajr;
			const isha = method.params?.Isha;
			console.log(`  ${pc.cyan(String(method.id).padStart(2))}  ${pc.bold(method.name)}`);
			if (fajr !== undefined && isha !== undefined) {
				console.log(pc.dim(`      Fajr: ${fajr}°, Isha: ${isha}${typeof isha === 'number' ? '°' : ''}`));
			}
		}

		console.log('');
		console.log(pc.dim('  Set method: azaan config --method <id>'));
		console.log('');
	} catch (err) {
		spinner.fail(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
		process.exit(1);
	}
};
