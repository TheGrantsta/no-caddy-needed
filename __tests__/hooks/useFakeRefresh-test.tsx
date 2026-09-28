import { renderHook, act } from '@testing-library/react-native';
import { useFakeRefresh } from '../../hooks/useFakeRefresh';

jest.useFakeTimers();

describe('useFakeRefresh', () => {
    afterEach(() => {
        jest.clearAllTimers();
    });

    it('initializes refreshing as false', () => {
        const mockRefetch = jest.fn();
        const { result } = renderHook(() => useFakeRefresh(mockRefetch));

        expect(result.current.refreshing).toBe(false);
        expect(result.current.onRefresh).toBeDefined();
    });

    it('calls refetch function when onRefresh is invoked', async () => {
        const mockRefetch = jest.fn().mockResolvedValue(undefined);
        const { result } = renderHook(() => useFakeRefresh(mockRefetch));

        await act(async () => {
            result.current.onRefresh();
        });

        expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('sets refreshing to true immediately when onRefresh is called', async () => {
        const mockRefetch = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        const { result } = renderHook(() => useFakeRefresh(mockRefetch));

        await act(async () => {
            result.current.onRefresh();
        });

        expect(result.current.refreshing).toBe(true);
    });

    it('handles slow refetch', async () => {
        const mockRefetch = jest.fn().mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, 200))
        );
        const { result } = renderHook(() => useFakeRefresh(mockRefetch));

        await act(async () => {
            result.current.onRefresh();
        });

        expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('uses custom delay parameter', () => {
        const mockRefetch = jest.fn();
        const { result } = renderHook(() => useFakeRefresh(mockRefetch, 500));

        expect(result.current).toBeDefined();
    });
});
