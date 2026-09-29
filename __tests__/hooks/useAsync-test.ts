import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAsync } from '../../hooks/useAsync';

describe('useAsync', () => {
    it('initializes with loading state when immediate is true', () => {
        const asyncFn = jest.fn().mockResolvedValue('result');
        const { result } = renderHook(() => useAsync(asyncFn, true));

        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe(null);
        expect(result.current.data).toBe(null);
    });

    it('initializes without loading when immediate is false', () => {
        const asyncFn = jest.fn().mockResolvedValue('result');
        const { result } = renderHook(() => useAsync(asyncFn, false));

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(result.current.data).toBe(null);
    });

    it('returns data after successful execution', async () => {
        const asyncFn = jest.fn().mockResolvedValue('test data');
        const { result } = renderHook(() => useAsync(asyncFn, false));

        act(() => {
            result.current.execute();
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).toBe('test data');
        expect(result.current.error).toBe(null);
    });

    it('sets error on failed execution', async () => {
        const testError = new Error('test error');
        const asyncFn = jest.fn().mockRejectedValue(testError);
        const { result } = renderHook(() => useAsync(asyncFn, false));

        act(() => {
            result.current.execute().catch(() => {});
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toEqual(testError);
        expect(result.current.data).toBe(null);
    });

    it('sets loading to true during execution', async () => {
        const asyncFn = jest.fn(() => new Promise(resolve => setTimeout(() => resolve('done'), 100)));
        const { result } = renderHook(() => useAsync(asyncFn, false));

        act(() => {
            result.current.execute();
        });

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });
});
