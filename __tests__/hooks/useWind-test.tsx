import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { fetchWind } from '../../service/WeatherService';
import { useWind } from '../../hooks/useWind';

jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    watchHeadingAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
}));

jest.mock('../../service/WeatherService', () => ({
    fetchWind: jest.fn(),
}));

const mockRequestPermission = Location.requestForegroundPermissionsAsync as jest.Mock;
const mockWatchHeading = Location.watchHeadingAsync as jest.Mock;
const mockGetPosition = Location.getCurrentPositionAsync as jest.Mock;
const mockFetchWind = fetchWind as jest.Mock;

describe('useWind', () => {
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        mockRequestPermission.mockResolvedValue({ status: 'granted' });
        mockWatchHeading.mockResolvedValue({ remove: jest.fn() });
        mockGetPosition.mockResolvedValue({ coords: { latitude: 52.5, longitude: 13.4 } });
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    it('startsWithNullWindAndZeroHeading', () => {
        const { result } = renderHook(() => useWind());
        expect(result.current.wind).toBeNull();
        expect(result.current.heading).toBe(0);
    });

    it('requestsPermissionAndSubscribesToHeadingOnMount', async () => {
        renderHook(() => useWind());
        await waitFor(() => expect(mockWatchHeading).toHaveBeenCalled());
        expect(mockRequestPermission).toHaveBeenCalled();
    });

    it('updatesHeadingFromTrueHeadingWhenAvailable', async () => {
        let headingCb: (h: { trueHeading: number; magHeading: number }) => void = () => {};
        mockWatchHeading.mockImplementation(async (cb: any) => {
            headingCb = cb;
            return { remove: jest.fn() };
        });

        const { result } = renderHook(() => useWind());
        await waitFor(() => expect(mockWatchHeading).toHaveBeenCalled());

        act(() => headingCb({ trueHeading: 123, magHeading: 120 }));
        expect(result.current.heading).toBe(123);
    });

    it('fallsBackToMagHeadingWhenTrueHeadingNegative', async () => {
        let headingCb: (h: { trueHeading: number; magHeading: number }) => void = () => {};
        mockWatchHeading.mockImplementation(async (cb: any) => {
            headingCb = cb;
            return { remove: jest.fn() };
        });

        const { result } = renderHook(() => useWind());
        await waitFor(() => expect(mockWatchHeading).toHaveBeenCalled());

        act(() => headingCb({ trueHeading: -1, magHeading: 200 }));
        expect(result.current.heading).toBe(200);
    });

    it('refreshWindSetsWindOnSuccess', async () => {
        mockFetchWind.mockResolvedValue({ directionFrom: 270, speedMph: 12 });

        const { result } = renderHook(() => useWind());

        await act(async () => { await result.current.refreshWind(); });

        expect(mockFetchWind).toHaveBeenCalledWith(52.5, 13.4);
        expect(result.current.wind).toEqual({ directionFrom: 270, speedMph: 12 });
    });

    it('keepsPreviousWindWhenFetchFails', async () => {
        mockFetchWind.mockResolvedValueOnce({ directionFrom: 270, speedMph: 12 });

        const { result } = renderHook(() => useWind());
        await act(async () => { await result.current.refreshWind(); });
        expect(result.current.wind).toEqual({ directionFrom: 270, speedMph: 12 });

        mockFetchWind.mockRejectedValueOnce(new Error('offline'));
        await act(async () => { await result.current.refreshWind(); });

        // unchanged — previous value retained
        expect(result.current.wind).toEqual({ directionFrom: 270, speedMph: 12 });
    });

    it('keepsPreviousWindWhenLocationFails', async () => {
        mockFetchWind.mockResolvedValueOnce({ directionFrom: 90, speedMph: 8 });

        const { result } = renderHook(() => useWind());
        await act(async () => { await result.current.refreshWind(); });
        expect(result.current.wind).toEqual({ directionFrom: 90, speedMph: 8 });

        mockGetPosition.mockRejectedValueOnce(new Error('no gps'));
        await act(async () => { await result.current.refreshWind(); });

        expect(result.current.wind).toEqual({ directionFrom: 90, speedMph: 8 });
    });

    describe('dev diagnostics', () => {
        it('warnsWhenLocationPermissionNotGranted', async () => {
            mockRequestPermission.mockResolvedValue({ status: 'denied' });

            renderHook(() => useWind());

            await waitFor(() =>
                expect(warnSpy).toHaveBeenCalledWith('[useWind]', expect.stringContaining('permission not granted'))
            );
        });

        it('warnsWhenRefreshWindFails', async () => {
            mockGetPosition.mockRejectedValueOnce(new Error('no gps fix'));

            const { result } = renderHook(() => useWind());
            await act(async () => { await result.current.refreshWind(); });

            expect(warnSpy).toHaveBeenCalledWith(
                '[useWind]',
                expect.stringContaining('could not refresh wind'),
                expect.any(Error)
            );
        });
    });
});
