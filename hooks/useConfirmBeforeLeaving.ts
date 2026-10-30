import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

// Intercepts every way of leaving a screen (header back, swipe back, Android back)
// while `isActive` is true, and calls `onAttemptLeave` so the screen can ask first.
// Call `leave()` once the user has confirmed to let the exit through.
export const useConfirmBeforeLeaving = (isActive: boolean, onAttemptLeave: () => void) => {
    const navigation = useNavigation();
    const router = useRouter();
    const allowLeaveRef = useRef(false);
    const onAttemptLeaveRef = useRef(onAttemptLeave);
    onAttemptLeaveRef.current = onAttemptLeave;

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
