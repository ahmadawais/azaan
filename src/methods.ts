// Map countries to recommended calculation methods
const countryMethodMap: Record<string, number> = {
	// ISNA (2) - North America
	'United States': 2,
	'USA': 2,
	'US': 2,
	'Canada': 2,
	'Mexico': 2,

	// Karachi (1) - South Asia
	'Pakistan': 1,
	'Bangladesh': 1,
	'India': 1,
	'Afghanistan': 1,

	// MWL (3) - Europe & others
	'United Kingdom': 3,
	'UK': 3,
	'Germany': 3,
	'Netherlands': 3,
	'Belgium': 3,
	'Sweden': 3,
	'Norway': 3,
	'Denmark': 3,
	'Finland': 3,
	'Austria': 3,
	'Switzerland': 3,
	'Poland': 3,
	'Italy': 3,
	'Spain': 3,
	'Greece': 3,
	'Japan': 3,
	'China': 3,
	'South Korea': 3,
	'Australia': 3,
	'New Zealand': 3,
	'South Africa': 3,

	// Makkah (4) - Arabian Peninsula
	'Saudi Arabia': 4,
	'Yemen': 4,
	'Oman': 4,
	'Bahrain': 4,

	// Egypt (5)
	'Egypt': 5,
	'Syria': 5,
	'Lebanon': 5,
	'Palestine': 5,
	'Jordan': 5,
	'Iraq': 5,
	'Libya': 5,
	'Sudan': 5,

	// Tehran (7) - Iran
	'Iran': 7,

	// Gulf (8)
	// Already covered by specific countries

	// Kuwait (9)
	'Kuwait': 9,

	// Qatar (10)
	'Qatar': 10,

	// Singapore (11)
	'Singapore': 11,

	// France (12)
	'France': 12,

	// Turkey (13)
	'Turkey': 13,
	'Türkiye': 13,

	// Russia (14)
	'Russia': 14,

	// Dubai (16)
	'United Arab Emirates': 16,
	'UAE': 16,

	// Malaysia (17)
	'Malaysia': 17,
	'Brunei': 17,

	// Tunisia (18)
	'Tunisia': 18,

	// Algeria (19)
	'Algeria': 19,

	// Indonesia (20)
	'Indonesia': 20,

	// Morocco (21)
	'Morocco': 21,

	// Portugal (22)
	'Portugal': 22,

	// Jordan (23) - already using Egypt (5) which is common there
};

export const getRecommendedMethod = (country: string): number | null => {
	// Try exact match first
	if (countryMethodMap[country]) {
		return countryMethodMap[country];
	}

	// Try case-insensitive match
	const lowerCountry = country.toLowerCase();
	for (const [key, value] of Object.entries(countryMethodMap)) {
		if (key.toLowerCase() === lowerCountry) {
			return value;
		}
	}

	// Default to MWL (3) for unknown countries - it's widely accepted
	return null;
};

// Hanafi countries (later Asr time)
const hanafiCountries = new Set([
	'Pakistan',
	'Bangladesh',
	'India',
	'Afghanistan',
	'Turkey',
	'Türkiye',
	'Iraq',
	'Syria',
	'Jordan',
	'Palestine',
	'Central Asia',
	'Kazakhstan',
	'Uzbekistan',
	'Tajikistan',
	'Turkmenistan',
	'Kyrgyzstan',
]);

export const getRecommendedSchool = (country: string): number => {
	// Check if Hanafi country
	if (hanafiCountries.has(country)) {
		return 1; // Hanafi
	}
	// Check case-insensitive
	for (const c of hanafiCountries) {
		if (c.toLowerCase() === country.toLowerCase()) {
			return 1;
		}
	}
	return 0; // Shafi (default)
};

export const getMethodName = (id: number): string => {
	const methods: Record<number, string> = {
		0: 'Jafari',
		1: 'Karachi',
		2: 'ISNA',
		3: 'MWL',
		4: 'Makkah',
		5: 'Egypt',
		7: 'Tehran',
		8: 'Gulf',
		9: 'Kuwait',
		10: 'Qatar',
		11: 'Singapore',
		12: 'France',
		13: 'Turkey',
		14: 'Russia',
		15: 'Moonsighting',
		16: 'Dubai',
		17: 'JAKIM',
		18: 'Tunisia',
		19: 'Algeria',
		20: 'Indonesia',
		21: 'Morocco',
		22: 'Portugal',
		23: 'Jordan',
	};
	return methods[id] || 'Unknown';
};
