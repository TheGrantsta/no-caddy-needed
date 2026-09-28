import { useState } from 'react';

export const useFakeRefresh = (refetchFn: () => Promise<void>, delay: number = 750) => {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refetchFn();
        } finally {
            setTimeout(() => {
                setRefreshing(false);
            }, delay);
        }
    };

    return { refreshing, onRefresh };
};
