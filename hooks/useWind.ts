import { useCallback, useEffect, useState } from 'react';
import { fetchWind, Wind } from '@/service/WeatherService';

let Location: typeof import('expo-location') | null = null;
try {
    Location = require('expo-location');
} catch {
    // Native module not available (e.g. Expo Go without a dev build)
}

/**
 * Provides local wind data and the device compass heading for the wind indicator.
 * - Subscribes to the compass heading continuously (true heading, falling back to magnetic).
 * - `refreshWind()` fetches the latest wind for the current GPS position.
 * - On any failure (permission denied, no GPS, offline, API down) the previous
 *   wind value is retained rather than cleared.
 */
export const useWind = () => {
    const [wind, setWind] = useState<Wind | null>(null);
    const [heading, setHeading] = useState(0);

    useEffect(() => {
        let subscription: { remove: () => void } | null = null;
        let cancelled = false;

        (async () => {
            if (!Location) return;
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted' || cancelled) return;
                subscription = await Location.watchHeadingAsync((h) => {
                    setHeading(h.trueHeading >= 0 ? h.trueHeading : h.magHeading);
                });
            } catch {
                // ignore — heading simply stays at its last value
            }
        })();

        return () => {
            cancelled = true;
            subscription?.remove();
        };
    }, []);

    const refreshWind = useCallback(async () => {
        if (!Location) return;
        try {
            const position = await Location.getCurrentPositionAsync();
            const next = await fetchWind(position.coords.latitude, position.coords.longitude);
            setWind(next);
        } catch {
            // keep the previous wind value until a fetch succeeds again
        }
    }, []);

    return { wind, heading, refreshWind };
};
