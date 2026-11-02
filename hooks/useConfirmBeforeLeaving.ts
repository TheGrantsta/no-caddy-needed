import { useCallback, useEffect, useRef } from 'react';
import { useRouter, useNavigation } from 'expo-router';

// Intercepts every way of leaving a screen (header back, swipe back, Android back)
// while `isActive` is true, and calls `onAttemptLeave` so the screen can ask first.
// Call `leave()` once the user has confirmed to let the exit through.
export const useConfirmBeforeLeaving = (isActive: boolean, onAttemptLeave: () => void) => {
    const navigation = useNavigation();
    const router = useRouter();
    const allowLeaveRef = useRef(false);
    const onAttemptLeaveRef = useRef(onAttemptLeave);

    // Keep the latest callback without writing the ref during render
    useEffect(() => {
        onAttemptLeaveRef.current = onAttemptLeave;
    }, [onAttemptLeave]);

    useEffect(() => {
        return navigation.addListener('beforeRemove', (e: any) => {
            if (!isActive || allowLeaveRef.current) return;
            e.preventDefault();
            onAttemptLeaveRef.current();
        });
    }, [navigation, isActive]);

    const leave = useCallback(() => {
        allowLeaveRef.current = true;
        router.back();
    }, [router]);

    return { leave };
};
