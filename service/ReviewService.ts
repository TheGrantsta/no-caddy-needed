import { Linking } from 'react-native';

let StoreReview: typeof import('expo-store-review') | null = null;
try {
    StoreReview = require('expo-store-review');
} catch {
    // Native module not available (e.g. Expo Go without a dev build)
}

/** Show the in-app review prompt once the user has finished at least this many rounds. */
const REVIEW_AFTER_ROUNDS = 1;

/**
 * Requests the native in-app review prompt after a "signature interaction" (a completed round),
 * gated so it is only asked once. Returns true only when it actually triggered the prompt so the
 * caller can persist the shown-flag and log the event.
 */
export const maybeRequestRoundReviewService = async (roundCount: number, alreadyShown: boolean): Promise<boolean> => {
    if (alreadyShown || roundCount < REVIEW_AFTER_ROUNDS || !StoreReview) return false;
    try {
        if (!(await StoreReview.isAvailableAsync())) return false;
        await StoreReview.requestReview();
        return true;
    } catch {
        return false;
    }
};

/**
 * Manual "Rate my app" action. Deep-links to the store review page when store URLs are configured
 * (`ios.appStoreUrl` / `android.playStoreUrl`); otherwise falls back to the native prompt.
 */
export const openStoreReviewService = async (): Promise<void> => {
    if (!StoreReview) return;
    try {
        const url = StoreReview.storeUrl();
        if (url) {
            await Linking.openURL(url);
        } else {
            await StoreReview.requestReview();
        }
    } catch {
        // ignore — nothing more we can do
    }
};
