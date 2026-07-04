export type DistanceUnit = 'yards' | 'metres';

export const METRES_PER_YARD = 0.9144;

export const yardsToMetres = (yards: number): number => yards * METRES_PER_YARD;

export const metresToYards = (metres: number): number => metres / METRES_PER_YARD;

export const yardsToDisplayUnit = (yards: number, unit: DistanceUnit): number =>
	unit === 'metres' ? Math.round(yardsToMetres(yards)) : Math.round(yards);

export const displayUnitToYards = (value: number, unit: DistanceUnit): number =>
	unit === 'metres' ? Math.round(metresToYards(value)) : Math.round(value);

export const extractDistanceAndUnit = (transcript: string): { value: number; unit: DistanceUnit } | null => {
	const match = transcript.toLowerCase().match(/\b(\d+)\s*(yards?|met(?:re|er)s?)\b/);
	if (!match) return null;
	return { value: parseInt(match[1], 10), unit: match[2].startsWith('y') ? 'yards' : 'metres' };
};
