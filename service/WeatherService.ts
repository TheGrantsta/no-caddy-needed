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
