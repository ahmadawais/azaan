const API_BASE = 'https://api.aladhan.com/v1';

export interface PrayerTimings {
	Fajr: string;
	Sunrise: string;
	Dhuhr: string;
	Asr: string;
	Sunset: string;
	Maghrib: string;
	Isha: string;
	Imsak: string;
	Midnight: string;
	Firstthird: string;
	Lastthird: string;
}

export interface HijriDate {
	date: string;
	day: string;
	month: {number: number; en: string; ar: string};
	year: string;
	weekday: {en: string; ar: string};
}

export interface GregorianDate {
	date: string;
	day: string;
	month: {number: number; en: string};
	year: string;
	weekday: {en: string};
}

export interface PrayerMeta {
	latitude: number;
	longitude: number;
	timezone: string;
	method: {id: number; name: string};
	school: {id: number; name: string};
}

export interface PrayerData {
	timings: PrayerTimings;
	date: {
		readable: string;
		timestamp: string;
		hijri: HijriDate;
		gregorian: GregorianDate;
	};
	meta: PrayerMeta;
}

export interface ApiResponse<T> {
	code: number;
	status: string;
	data: T;
}

export interface NextPrayerData {
	timings: PrayerTimings;
	date: PrayerData['date'];
	meta: PrayerMeta;
	nextPrayer: string;
	nextPrayerTime: string;
}

export interface CalculationMethod {
	id: number;
	name: string;
	params: {Fajr: number; Isha: number | string};
}

export interface MethodsResponse {
	[key: string]: CalculationMethod;
}

const formatDate = (date: Date): string => {
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = date.getFullYear();
	return `${day}-${month}-${year}`;
};

export const fetchTimingsByCity = async (opts: {
	city: string;
	country: string;
	method?: number;
	school?: number;
	date?: Date;
}): Promise<PrayerData> => {
	const date = formatDate(opts.date || new Date());
	const params = new URLSearchParams({
		city: opts.city,
		country: opts.country,
	});
	if (opts.method !== undefined) params.set('method', String(opts.method));
	if (opts.school !== undefined) params.set('school', String(opts.school));

	const res = await fetch(`${API_BASE}/timingsByCity/${date}?${params}`);
	const json = (await res.json()) as ApiResponse<PrayerData>;
	if (json.code !== 200) throw new Error(json.status);
	return json.data;
};

export const fetchTimingsByCoords = async (opts: {
	latitude: number;
	longitude: number;
	method?: number;
	school?: number;
	timezone?: string;
	date?: Date;
}): Promise<PrayerData> => {
	const date = formatDate(opts.date || new Date());
	const params = new URLSearchParams({
		latitude: String(opts.latitude),
		longitude: String(opts.longitude),
	});
	if (opts.method !== undefined) params.set('method', String(opts.method));
	if (opts.school !== undefined) params.set('school', String(opts.school));
	if (opts.timezone) params.set('timezonestring', opts.timezone);

	const res = await fetch(`${API_BASE}/timings/${date}?${params}`);
	const json = (await res.json()) as ApiResponse<PrayerData>;
	if (json.code !== 200) throw new Error(json.status);
	return json.data;
};

export const fetchNextPrayer = async (opts: {
	latitude: number;
	longitude: number;
	method?: number;
	school?: number;
	timezone?: string;
}): Promise<NextPrayerData> => {
	const date = formatDate(new Date());
	const params = new URLSearchParams({
		latitude: String(opts.latitude),
		longitude: String(opts.longitude),
	});
	if (opts.method !== undefined) params.set('method', String(opts.method));
	if (opts.school !== undefined) params.set('school', String(opts.school));
	if (opts.timezone) params.set('timezonestring', opts.timezone);

	const res = await fetch(`${API_BASE}/nextPrayer/${date}?${params}`);
	const json = (await res.json()) as ApiResponse<NextPrayerData>;
	if (json.code !== 200) throw new Error(json.status);
	return json.data;
};

export const fetchCalendarByCity = async (opts: {
	city: string;
	country: string;
	year: number;
	month?: number;
	method?: number;
	school?: number;
}): Promise<PrayerData[]> => {
	const params = new URLSearchParams({
		city: opts.city,
		country: opts.country,
	});
	if (opts.method !== undefined) params.set('method', String(opts.method));
	if (opts.school !== undefined) params.set('school', String(opts.school));

	const path = opts.month ? `${opts.year}/${opts.month}` : String(opts.year);
	const res = await fetch(`${API_BASE}/calendarByCity/${path}?${params}`);
	const json = (await res.json()) as ApiResponse<PrayerData[]>;
	if (json.code !== 200) throw new Error(json.status);
	return json.data;
};

export const fetchMethods = async (): Promise<MethodsResponse> => {
	const res = await fetch(`${API_BASE}/methods`);
	const json = (await res.json()) as ApiResponse<MethodsResponse>;
	if (json.code !== 200) throw new Error(json.status);
	return json.data;
};

export interface QiblaData {
	latitude: number;
	longitude: number;
	direction: number;
}

export const fetchQibla = async (latitude: number, longitude: number): Promise<QiblaData> => {
	const res = await fetch(`${API_BASE}/qibla/${latitude}/${longitude}`);
	const json = (await res.json()) as ApiResponse<QiblaData>;
	if (json.code !== 200) throw new Error(json.status);
	return json.data;
};
