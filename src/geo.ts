interface GeoLocation {
	city: string;
	country: string;
	latitude: number;
	longitude: number;
	timezone: string;
}

interface IpApiResponse {
	city?: string;
	country?: string;
	lat?: number;
	lon?: number;
	timezone?: string;
}

interface IpapiCoResponse {
	city?: string;
	country_name?: string;
	latitude?: number;
	longitude?: number;
	timezone?: string;
}

interface IpWhoisResponse {
	success?: boolean;
	city?: string;
	country?: string;
	latitude?: number;
	longitude?: number;
	timezone?: { id?: string };
}

// Try ip-api.com first (free, no key)
const tryIpApi = async (): Promise<GeoLocation | null> => {
	try {
		const res = await fetch('http://ip-api.com/json/?fields=city,country,lat,lon,timezone');
		const data = await res.json() as IpApiResponse;
		if (data.city && data.country && data.lat !== undefined && data.lon !== undefined) {
			return {
				city: data.city,
				country: data.country,
				latitude: data.lat,
				longitude: data.lon,
				timezone: data.timezone || '',
			};
		}
	} catch {}
	return null;
};

// Fallback to ipapi.co (free, no key, 1000/day)
const tryIpapiCo = async (): Promise<GeoLocation | null> => {
	try {
		const res = await fetch('https://ipapi.co/json/');
		const data = await res.json() as IpapiCoResponse;
		if (data.city && data.country_name && data.latitude !== undefined && data.longitude !== undefined) {
			return {
				city: data.city,
				country: data.country_name,
				latitude: data.latitude,
				longitude: data.longitude,
				timezone: data.timezone || '',
			};
		}
	} catch {}
	return null;
};

// Fallback to ipwho.is (free, no key, unlimited)
const tryIpWhois = async (): Promise<GeoLocation | null> => {
	try {
		const res = await fetch('https://ipwho.is/');
		const data = await res.json() as IpWhoisResponse;
		if (data.success && data.city && data.country && data.latitude !== undefined && data.longitude !== undefined) {
			return {
				city: data.city,
				country: data.country,
				latitude: data.latitude,
				longitude: data.longitude,
				timezone: data.timezone?.id || '',
			};
		}
	} catch {}
	return null;
};

export const guessLocation = async (): Promise<GeoLocation | null> => {
	// Try multiple providers with fallback
	return await tryIpApi() || await tryIpapiCo() || await tryIpWhois();
};
