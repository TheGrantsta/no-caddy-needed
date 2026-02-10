type AnalyticsModule = typeof import('@react-native-firebase/analytics').default;
type CrashlyticsModule = typeof import('@react-native-firebase/crashlytics').default;

let analyticsModule: AnalyticsModule | null = null;
let crashlyticsModule: CrashlyticsModule | null = null;

try {
    analyticsModule = require('@react-native-firebase/analytics').default;
} catch {
    // Analytics module not available
}

try {
    crashlyticsModule = require('@react-native-firebase/crashlytics').default;
} catch {
    // Crashlytics module not available
}

const getAnalytics = () => {
    try {
        return analyticsModule?.();
    } catch {
        return null;
    }
};

const getCrashlytics = () => {
    try {
        return crashlyticsModule?.();
    } catch {
        return null;
    }
};

export const initializeAnalytics = async (): Promise<void> => {
    try {
        const crashlytics = getCrashlytics();
        await crashlytics?.setCrashlyticsCollectionEnabled(true);
    } catch {
        // Initialization failed silently
    }
};

export const logEvent = async (
    name: string,
    params?: Record<string, unknown>
): Promise<void> => {
    try {
        const analytics = getAnalytics();
        await analytics?.logEvent(name, params);
    } catch {
        // Event logging failed silently
    }
};

export interface DrillCompletedParams {
    drillName: string;
    success: boolean;
    category: string;
}

export const logDrillCompleted = async (params: DrillCompletedParams): Promise<void> => {
    await logEvent('drill_completed', {
        drill_name: params.drillName,
        success: params.success,
        category: params.category,
    });
};

export interface RoundStartedParams {
    playerCount: number;
}

export const logRoundStarted = async (params: RoundStartedParams): Promise<void> => {
    await logEvent('round_started', {
        player_count: params.playerCount,
    });
};

export interface RoundEndedParams {
    playerCount: number;
    holesPlayed: number;
}

export const logRoundEnded = async (params: RoundEndedParams): Promise<void> => {
    await logEvent('round_ended', {
        player_count: params.playerCount,
        holes_played: params.holesPlayed,
    });
};

export interface ScreenViewParams {
    screenName: string;
    screenClass?: string;
}

export const logScreenView = async (params: ScreenViewParams): Promise<void> => {
    try {
        const analytics = getAnalytics();
        await analytics?.logScreenView({
            screen_name: params.screenName,
            screen_class: params.screenClass ?? params.screenName,
        });
    } catch {
        // Screen view logging failed silently
    }
};

export const setUserId = async (userId: string): Promise<void> => {
    try {
        const crashlytics = getCrashlytics();
        await crashlytics?.setUserId(userId);
    } catch {
        // Set user ID failed silently
    }
};

export const setAttribute = async (key: string, value: string): Promise<void> => {
    try {
        const crashlytics = getCrashlytics();
        await crashlytics?.setAttribute(key, value);
    } catch {
        // Set attribute failed silently
    }
};

export const logBreadcrumb = async (message: string): Promise<void> => {
    try {
        const crashlytics = getCrashlytics();
        await crashlytics?.log(message);
    } catch {
        // Breadcrumb logging failed silently
    }
};

export const recordError = async (error: Error, context?: string): Promise<void> => {
    try {
        const crashlytics = getCrashlytics();
        if (context) {
            await crashlytics?.log(`Context: ${context}`);
        }
        await crashlytics?.recordError(error);
    } catch {
        // Error recording failed silently
    }
};
