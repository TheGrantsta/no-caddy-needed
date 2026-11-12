export type DistanceUnit = 'yards' | 'metres';

const METRES_PER_YARD = 0.9144;

const yardsToMetres = (yards: number): number => yards * METRES_PER_YARD;

const metresToYards = (metres: number): number => metres / METRES_PER_YARD;

export const distanceUnitLabel = (unit: DistanceUnit): string =>
	unit === 'metres' ? 'm' : 'yd';

export const yardsToDisplayUnit = (yards: number, unit: DistanceUnit): number =>
	unit === 'metres' ? Math.round(yardsToMetres(yards)) : Math.round(yards);

export const displayUnitToYards = (value: number, unit: DistanceUnit): number =>
	unit === 'metres' ? Math.round(metresToYards(value)) : Math.round(value);

