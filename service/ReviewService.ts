import { Linking } from 'react-native';

let StoreReview: typeof import('expo-store-review') | null = null;
try {
    StoreReview = require('expo-store-review');
} catch {
    // Native module not available (e.g. Expo Go without a dev build)
}

/** Re-ask for a review every this many completed rounds (after the first). */
const REVIEW_EVERY_ROUNDS = 6;

/**
 * Decides whether to request the native in-app review prompt after a completed round.
 * Shown after the 1st round and then every {@link REVIEW_EVERY_ROUNDS} rounds (1, 7, 13, …).
 * The OS additionally rate-limits how often the prompt actually appears.
 * Returns true only when it actually triggered the prompt so the caller can log the event.
 */
export const maybeRequestRoundReviewService = async (roundCount: number): Promise<boolean> => {
    if (roundCount < 1 || (roundCount - 1) % REVIEW_EVERY_ROUNDS !== 0 || !StoreReview) return false;
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
