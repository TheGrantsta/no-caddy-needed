export type Wind = { directionFrom: number; speedMph: number };

/**
 * Fetches current wind from Open-Meteo (free, no API key required).
 * `directionFrom` is the meteorological direction the wind comes FROM, in degrees.
 * Throws on network error or non-ok response so callers can retain the previous value.
 */
export const fetchWind = async (latitude: number, longitude: number): Promise<Wind> => {
    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=mph`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json() as { current?: { wind_speed_10m?: number; wind_direction_10m?: number } };
    const current = data.current;

    if (!current || typeof current.wind_speed_10m !== 'number' || typeof current.wind_direction_10m !== 'number') {
        throw new Error('Weather API returned no wind data');
    }

    return { directionFrom: current.wind_direction_10m, speedMph: current.wind_speed_10m };
};

/** Normalises an angle in degrees into the [0, 360) range. */
export const normalize360 = (deg: number): number => ((deg % 360) + 360) % 360;

/**
 * Rotation (degrees) for an arrow that points the way the wind blows TOward,
 * oriented to the device compass. `directionFrom` is where wind comes from;
 * +180 makes it point downwind; subtracting `heading` keeps it aligned to the
 * real world as the phone rotates.
 */
export const getWindArrowRotation = (directionFrom: number, heading: number): number =>
    normalize360(directionFrom + 180 - heading);

// Rule-of-thumb coefficients: a headwind hurts more than a tailwind helps.
export const HEAD_PCT_PER_MPH = 1.0;
export const TAIL_PCT_PER_MPH = 0.5;
// Cap the adjustment so high winds don't produce absurd figures.
export const MAX_PLAYS_LONGER_PCT = 25;
// Below this speed the effect is treated as negligible.
export const CALM_MPH = 3;
// Lateral component below this (mph) isn't worth flagging as a crosswind.
const CROSS_THRESHOLD_MPH = 1;

export type WindEffect = {
    alongComponentMph: number;    // + tailwind (helps), - headwind (hurts)
    crossComponentMph: number;    // signed lateral component
    playsLongerPercent: number;   // + plays longer (into wind), - shorter (downwind), clamped
    category: 'headwind' | 'tailwind' | 'crosswind' | 'calm';
    crossDirection: 'left' | 'right' | null;
};

const clamp = (value: number, min: number, max: number): number =>
    Math.max(min, Math.min(max, value));

/**
 * Rough, trajectory-agnostic estimate of how the wind plays, derived from the
 * along-shot component (`speed × cos(rotation)`). Assumes the player points the
 * top of the phone at the target so `heading` approximates the shot line. The
 * figure is a guide, not a precise number.
 */
export const getWindEffect = (directionFrom: number, speedMph: number, heading: number): WindEffect => {
    const rotationRad = (getWindArrowRotation(directionFrom, heading) * Math.PI) / 180;
    const alongComponentMph = speedMph * Math.cos(rotationRad);   // + tailwind
    const crossComponentMph = speedMph * Math.sin(rotationRad);   // + pushes ball right

    const coeff = alongComponentMph >= 0 ? TAIL_PCT_PER_MPH : HEAD_PCT_PER_MPH;
    const playsLongerPercent = clamp(
        -alongComponentMph * coeff,
        -MAX_PLAYS_LONGER_PCT,
        MAX_PLAYS_LONGER_PCT
    );

    // Positive cross pushes the ball right, i.e. the wind comes from the left.
    const crossDirection =
        Math.abs(crossComponentMph) < CROSS_THRESHOLD_MPH
            ? null
            : crossComponentMph > 0 ? 'left' : 'right';

    let category: WindEffect['category'];
    if (speedMph < CALM_MPH) {
        category = 'calm';
    } else if (Math.abs(crossComponentMph) > Math.abs(alongComponentMph)) {
        category = 'crosswind';
    } else {
        category = alongComponentMph >= 0 ? 'tailwind' : 'headwind';
    }

    return { alongComponentMph, crossComponentMph, playsLongerPercent, category, crossDirection };
};
