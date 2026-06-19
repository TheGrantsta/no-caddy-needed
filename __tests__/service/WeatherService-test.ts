import { fetchWind, degreesToCompass } from '../../service/WeatherService';

const mockFetchResponse = (body: object, ok = true, status = 200) => {
    global.fetch = jest.fn().mockResolvedValue({
        ok,
        status,
        text: jest.fn().mockResolvedValue(''),
        json: jest.fn().mockResolvedValue(body),
    });
};

const WIND_BODY = {
    current_units: { wind_speed_10m: 'mp/h', wind_direction_10m: '°' },
    current: { wind_speed_10m: 10.6, wind_direction_10m: 278 },
};

describe('fetchWind', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returnsDirectionFromAndSpeedMphOnSuccess', async () => {
        mockFetchResponse(WIND_BODY);

        const result = await fetchWind(52.52, 13.41);

        expect(result).toEqual({ directionFrom: 278, speedMph: 10.6 });
    });

    it('requestsOpenMeteoWithCoordsAndMphUnits', async () => {
        mockFetchResponse(WIND_BODY);

        await fetchWind(52.52, 13.41);

        const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
        expect(url).toContain('api.open-meteo.com');
        expect(url).toContain('latitude=52.52');
        expect(url).toContain('longitude=13.41');
        expect(url).toContain('wind_speed_unit=mph');
        expect(url).toContain('current=wind_speed_10m,wind_direction_10m');
    });

    it('throwsWhenResponseNotOk', async () => {
        mockFetchResponse({}, false, 500);

        await expect(fetchWind(1, 2)).rejects.toThrow();
    });

    it('throwsWhenFetchRejects', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

        await expect(fetchWind(1, 2)).rejects.toThrow('network down');
    });
});

describe('degreesToCompass', () => {
    it('mapsCardinalPoints', () => {
        expect(degreesToCompass(0)).toBe('N');
        expect(degreesToCompass(90)).toBe('E');
        expect(degreesToCompass(180)).toBe('S');
        expect(degreesToCompass(270)).toBe('W');
    });

    it('mapsIntercardinalPoints', () => {
        expect(degreesToCompass(45)).toBe('NE');
        expect(degreesToCompass(247.5)).toBe('WSW');
    });

    it('roundsToNearestSixteenthAndWraps', () => {
        expect(degreesToCompass(11)).toBe('N');   // < 11.25 rounds down to N
        expect(degreesToCompass(349)).toBe('N');  // wraps past 360 back to N
    });

    it('normalisesOutOfRangeDegrees', () => {
        expect(degreesToCompass(360)).toBe('N');
        expect(degreesToCompass(-90)).toBe('W');
    });
});
