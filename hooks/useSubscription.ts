import { useState, useEffect } from 'react';
import { checkPremiumEntitlement } from '../service/SubscriptionService';

export type UseSubscriptionReturn = {
    isPremium: boolean;
    isLoading: boolean;
    error: string | null;
};

export function useSubscription(): UseSubscriptionReturn {
    const [isPremium, setIsPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkPremiumEntitlement()
            .then(setIsPremium)
            .catch(() => setError('Failed to check subscription'))
            .finally(() => setIsLoading(false));
    }, []);

    return { isPremium, isLoading, error };
}
