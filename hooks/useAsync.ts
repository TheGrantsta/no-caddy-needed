import { useState, useCallback } from 'react';

interface AsyncState<T> {
    loading: boolean;
    error: Error | null;
    data: T | null;
}

export function useAsync<T>(
    asyncFunction: () => Promise<T>,
    immediate: boolean = true
) {
    const [state, setState] = useState<AsyncState<T>>({
        loading: immediate,
        error: null,
        data: null,
    });

    const execute = useCallback(async () => {
        setState({ loading: true, error: null, data: null });
        try {
            const result = await asyncFunction();
            setState({ loading: false, error: null, data: result });
            return result;
        } catch (error) {
            setState({
                loading: false,
                error: error instanceof Error ? error : new Error(String(error)),
                data: null,
            });
            throw error;
        }
    }, [asyncFunction]);

    return { ...state, execute };
}
