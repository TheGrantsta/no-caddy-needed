import { useState } from 'react';

// Drives the pull-to-refresh spinner for the duration of the refetch
export const useFakeRefresh = (refetchFn: () => void | Promise<void>) => {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refetchFn();
        } finally {
            setRefreshing(false);
        }
    };

    return { refreshing, onRefresh };
};
