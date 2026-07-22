import Conf from 'conf';

interface AthanConfig {
	latitude?: number;
	longitude?: number;
	city?: string;
	country?: string;
	method?: number;
	school?: number;
	timezone?: string;
	format24h?: boolean;
}

export const config = new Conf<AthanConfig>({
	projectName: 'azaan',
	defaults: {
		method: 2, // ISNA
		school: 0, // Shafi
		format24h: false,
	},
});

export const getLocation = (): {city?: string; country?: string; latitude?: number; longitude?: number} => {
	return {
		city: config.get('city'),
		country: config.get('country'),
		latitude: config.get('latitude'),
		longitude: config.get('longitude'),
	};
};

export const hasLocation = (): boolean => {
	const loc = getLocation();
	return Boolean((loc.city && loc.country) || (loc.latitude !== undefined && loc.longitude !== undefined));
};

export const setLocation = (opts: {city?: string; country?: string; latitude?: number; longitude?: number}): void => {
	if (opts.city) config.set('city', opts.city);
	if (opts.country) config.set('country', opts.country);
	if (opts.latitude !== undefined) config.set('latitude', opts.latitude);
	if (opts.longitude !== undefined) config.set('longitude', opts.longitude);
};

export const setMethod = (method: number): void => {
	config.set('method', method);
};

export const setSchool = (school: number): void => {
	config.set('school', school);
};

export const setTimezone = (tz: string): void => {
	config.set('timezone', tz);
};

export const setFormat24h = (format24h: boolean): void => {
	config.set('format24h', format24h);
};

export const getAllConfig = (): AthanConfig => {
	return config.store;
};

export const clearConfig = (): void => {
	config.clear();
};
