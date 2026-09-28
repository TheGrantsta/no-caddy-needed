import { useState } from 'react';

export const useFakeRefresh = (refetchFn: () => void | Promise<void>, delay: number = 750) => {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetchFn();
        setTimeout(() => {
            setRefreshing(false);
        }, delay);
    };

    return { refreshing, onRefresh };
};
