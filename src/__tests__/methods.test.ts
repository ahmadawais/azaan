import { describe, it, expect } from 'vitest';
import { getRecommendedMethod, getRecommendedSchool, getMethodName } from '../methods.js';

describe('methods', () => {
	describe('getRecommendedMethod', () => {
		describe('North America - ISNA (2)', () => {
			it('should return ISNA for United States', () => {
				expect(getRecommendedMethod('United States')).toBe(2);
			});

			it('should return ISNA for USA', () => {
				expect(getRecommendedMethod('USA')).toBe(2);
			});

			it('should return ISNA for US', () => {
				expect(getRecommendedMethod('US')).toBe(2);
			});

			it('should return ISNA for Canada', () => {
				expect(getRecommendedMethod('Canada')).toBe(2);
			});

			it('should return ISNA for Mexico', () => {
				expect(getRecommendedMethod('Mexico')).toBe(2);
			});
		});

		describe('South Asia - Karachi (1)', () => {
			it('should return Karachi for Pakistan', () => {
				expect(getRecommendedMethod('Pakistan')).toBe(1);
			});

			it('should return Karachi for Bangladesh', () => {
				expect(getRecommendedMethod('Bangladesh')).toBe(1);
			});

			it('should return Karachi for India', () => {
				expect(getRecommendedMethod('India')).toBe(1);
			});

			it('should return Karachi for Afghanistan', () => {
				expect(getRecommendedMethod('Afghanistan')).toBe(1);
			});
		});

		describe('Europe - MWL (3)', () => {
			it('should return MWL for United Kingdom', () => {
				expect(getRecommendedMethod('United Kingdom')).toBe(3);
			});

			it('should return MWL for UK', () => {
				expect(getRecommendedMethod('UK')).toBe(3);
			});

			it('should return MWL for Germany', () => {
				expect(getRecommendedMethod('Germany')).toBe(3);
			});

			it('should return MWL for Netherlands', () => {
				expect(getRecommendedMethod('Netherlands')).toBe(3);
			});

			it('should return MWL for Australia', () => {
				expect(getRecommendedMethod('Australia')).toBe(3);
			});

			it('should return MWL for Japan', () => {
				expect(getRecommendedMethod('Japan')).toBe(3);
			});
		});

		describe('Arabian Peninsula - Makkah (4)', () => {
			it('should return Makkah for Saudi Arabia', () => {
				expect(getRecommendedMethod('Saudi Arabia')).toBe(4);
			});

			it('should return Makkah for Yemen', () => {
				expect(getRecommendedMethod('Yemen')).toBe(4);
			});

			it('should return Makkah for Oman', () => {
				expect(getRecommendedMethod('Oman')).toBe(4);
			});

			it('should return Makkah for Bahrain', () => {
				expect(getRecommendedMethod('Bahrain')).toBe(4);
			});
		});

		describe('Africa & Middle East - Egypt (5)', () => {
			it('should return Egypt for Egypt', () => {
				expect(getRecommendedMethod('Egypt')).toBe(5);
			});

			it('should return Egypt for Syria', () => {
				expect(getRecommendedMethod('Syria')).toBe(5);
			});

			it('should return Egypt for Lebanon', () => {
				expect(getRecommendedMethod('Lebanon')).toBe(5);
			});

			it('should return Egypt for Palestine', () => {
				expect(getRecommendedMethod('Palestine')).toBe(5);
			});

			it('should return Egypt for Jordan', () => {
				expect(getRecommendedMethod('Jordan')).toBe(5);
			});

			it('should return Egypt for Iraq', () => {
				expect(getRecommendedMethod('Iraq')).toBe(5);
			});

			it('should return Egypt for Libya', () => {
				expect(getRecommendedMethod('Libya')).toBe(5);
			});

			it('should return Egypt for Sudan', () => {
				expect(getRecommendedMethod('Sudan')).toBe(5);
			});
		});

		describe('Iran - Tehran (7)', () => {
			it('should return Tehran for Iran', () => {
				expect(getRecommendedMethod('Iran')).toBe(7);
			});
		});

		describe('Gulf Countries', () => {
			it('should return Kuwait method for Kuwait', () => {
				expect(getRecommendedMethod('Kuwait')).toBe(9);
			});

			it('should return Qatar method for Qatar', () => {
				expect(getRecommendedMethod('Qatar')).toBe(10);
			});

			it('should return Dubai method for UAE', () => {
				expect(getRecommendedMethod('United Arab Emirates')).toBe(16);
			});

			it('should return Dubai method for UAE abbreviation', () => {
				expect(getRecommendedMethod('UAE')).toBe(16);
			});
		});

		describe('Southeast Asia', () => {
			it('should return Singapore method for Singapore', () => {
				expect(getRecommendedMethod('Singapore')).toBe(11);
			});

			it('should return Malaysia method for Malaysia', () => {
				expect(getRecommendedMethod('Malaysia')).toBe(17);
			});

			it('should return Malaysia method for Brunei', () => {
				expect(getRecommendedMethod('Brunei')).toBe(17);
			});

			it('should return Indonesia method for Indonesia', () => {
				expect(getRecommendedMethod('Indonesia')).toBe(20);
			});
		});

		describe('Europe specific', () => {
			it('should return France method for France', () => {
				expect(getRecommendedMethod('France')).toBe(12);
			});

			it('should return Russia method for Russia', () => {
				expect(getRecommendedMethod('Russia')).toBe(14);
			});

			it('should return Portugal method for Portugal', () => {
				expect(getRecommendedMethod('Portugal')).toBe(22);
			});
		});

		describe('Turkey', () => {
			it('should return Turkey method for Turkey', () => {
				expect(getRecommendedMethod('Turkey')).toBe(13);
			});

			it('should return Turkey method for Türkiye', () => {
				expect(getRecommendedMethod('Türkiye')).toBe(13);
			});
		});

		describe('North Africa', () => {
			it('should return Tunisia method for Tunisia', () => {
				expect(getRecommendedMethod('Tunisia')).toBe(18);
			});

			it('should return Algeria method for Algeria', () => {
				expect(getRecommendedMethod('Algeria')).toBe(19);
			});

			it('should return Morocco method for Morocco', () => {
				expect(getRecommendedMethod('Morocco')).toBe(21);
			});
		});

		describe('Case insensitive matching', () => {
			it('should match case-insensitively', () => {
				expect(getRecommendedMethod('pakistan')).toBe(1);
				expect(getRecommendedMethod('PAKISTAN')).toBe(1);
				expect(getRecommendedMethod('PaKiStAn')).toBe(1);
			});

			it('should match case-insensitively for USA', () => {
				expect(getRecommendedMethod('usa')).toBe(2);
				expect(getRecommendedMethod('united states')).toBe(2);
			});
		});

		describe('Unknown countries', () => {
			it('should return null for unknown country', () => {
				expect(getRecommendedMethod('Unknown Country')).toBeNull();
			});

			it('should return null for empty string', () => {
				expect(getRecommendedMethod('')).toBeNull();
			});
		});
	});

	describe('getRecommendedSchool', () => {
		describe('Hanafi countries', () => {
			it('should return Hanafi (1) for Pakistan', () => {
				expect(getRecommendedSchool('Pakistan')).toBe(1);
			});

			it('should return Hanafi (1) for Bangladesh', () => {
				expect(getRecommendedSchool('Bangladesh')).toBe(1);
			});

			it('should return Hanafi (1) for India', () => {
				expect(getRecommendedSchool('India')).toBe(1);
			});

			it('should return Hanafi (1) for Afghanistan', () => {
				expect(getRecommendedSchool('Afghanistan')).toBe(1);
			});

			it('should return Hanafi (1) for Turkey', () => {
				expect(getRecommendedSchool('Turkey')).toBe(1);
			});

			it('should return Hanafi (1) for Türkiye', () => {
				expect(getRecommendedSchool('Türkiye')).toBe(1);
			});

			it('should return Hanafi (1) for Iraq', () => {
				expect(getRecommendedSchool('Iraq')).toBe(1);
			});

			it('should return Hanafi (1) for Syria', () => {
				expect(getRecommendedSchool('Syria')).toBe(1);
			});

			it('should return Hanafi (1) for Jordan', () => {
				expect(getRecommendedSchool('Jordan')).toBe(1);
			});

			it('should return Hanafi (1) for Palestine', () => {
				expect(getRecommendedSchool('Palestine')).toBe(1);
			});

			it('should return Hanafi (1) for Central Asian countries', () => {
				expect(getRecommendedSchool('Kazakhstan')).toBe(1);
				expect(getRecommendedSchool('Uzbekistan')).toBe(1);
				expect(getRecommendedSchool('Tajikistan')).toBe(1);
				expect(getRecommendedSchool('Turkmenistan')).toBe(1);
				expect(getRecommendedSchool('Kyrgyzstan')).toBe(1);
			});
		});

		describe('Shafi countries (default)', () => {
			it('should return Shafi (0) for Saudi Arabia', () => {
				expect(getRecommendedSchool('Saudi Arabia')).toBe(0);
			});

			it('should return Shafi (0) for Egypt', () => {
				expect(getRecommendedSchool('Egypt')).toBe(0);
			});

			it('should return Shafi (0) for USA', () => {
				expect(getRecommendedSchool('USA')).toBe(0);
			});

			it('should return Shafi (0) for UK', () => {
				expect(getRecommendedSchool('UK')).toBe(0);
			});

			it('should return Shafi (0) for unknown country', () => {
				expect(getRecommendedSchool('Unknown')).toBe(0);
			});
		});

		describe('Case insensitive matching', () => {
			it('should match Hanafi countries case-insensitively', () => {
				expect(getRecommendedSchool('pakistan')).toBe(1);
				expect(getRecommendedSchool('TURKEY')).toBe(1);
				expect(getRecommendedSchool('india')).toBe(1);
			});
		});
	});

	describe('getMethodName', () => {
		it('should return correct name for all methods', () => {
			expect(getMethodName(0)).toBe('Jafari');
			expect(getMethodName(1)).toBe('Karachi');
			expect(getMethodName(2)).toBe('ISNA');
			expect(getMethodName(3)).toBe('MWL');
			expect(getMethodName(4)).toBe('Makkah');
			expect(getMethodName(5)).toBe('Egypt');
			expect(getMethodName(7)).toBe('Tehran');
			expect(getMethodName(8)).toBe('Gulf');
			expect(getMethodName(9)).toBe('Kuwait');
			expect(getMethodName(10)).toBe('Qatar');
			expect(getMethodName(11)).toBe('Singapore');
			expect(getMethodName(12)).toBe('France');
			expect(getMethodName(13)).toBe('Turkey');
			expect(getMethodName(14)).toBe('Russia');
			expect(getMethodName(15)).toBe('Moonsighting');
			expect(getMethodName(16)).toBe('Dubai');
			expect(getMethodName(17)).toBe('JAKIM');
			expect(getMethodName(18)).toBe('Tunisia');
			expect(getMethodName(19)).toBe('Algeria');
			expect(getMethodName(20)).toBe('Indonesia');
			expect(getMethodName(21)).toBe('Morocco');
			expect(getMethodName(22)).toBe('Portugal');
			expect(getMethodName(23)).toBe('Jordan');
		});

		it('should return Unknown for invalid method ID', () => {
			expect(getMethodName(6)).toBe('Unknown');
			expect(getMethodName(99)).toBe('Unknown');
			expect(getMethodName(-1)).toBe('Unknown');
			expect(getMethodName(100)).toBe('Unknown');
		});
	});
});
