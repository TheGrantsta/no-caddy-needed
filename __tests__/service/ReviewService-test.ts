import { maybeRequestRoundReviewService, openStoreReviewService } from '../../service/ReviewService';
import * as StoreReview from 'expo-store-review';
import { Linking } from 'react-native';

jest.mock('expo-store-review', () => ({
    isAvailableAsync: jest.fn(),
    requestReview: jest.fn(),
    hasAction: jest.fn(),
    storeUrl: jest.fn(),
}));

const mockIsAvailable = StoreReview.isAvailableAsync as jest.Mock;
const mockRequestReview = StoreReview.requestReview as jest.Mock;
const mockStoreUrl = StoreReview.storeUrl as jest.Mock;

describe('maybeRequestRoundReviewService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsAvailable.mockResolvedValue(true);
        mockRequestReview.mockResolvedValue(undefined);
    });

    it('returnsFalseWhenAlreadyShown', async () => {
        const result = await maybeRequestRoundReviewService(5, true);
        expect(result).toBe(false);
        expect(mockRequestReview).not.toHaveBeenCalled();
    });

    it('returnsFalseWhenBelowThreshold', async () => {
        const result = await maybeRequestRoundReviewService(0, false);
        expect(result).toBe(false);
        expect(mockRequestReview).not.toHaveBeenCalled();
    });

    it('requestsReviewAndReturnsTrueAfterFirstRound', async () => {
        const result = await maybeRequestRoundReviewService(1, false);
        expect(mockRequestReview).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('returnsFalseWhenStoreReviewUnavailable', async () => {
        mockIsAvailable.mockResolvedValue(false);
        const result = await maybeRequestRoundReviewService(1, false);
        expect(mockRequestReview).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it('returnsFalseWhenRequestReviewThrows', async () => {
        mockRequestReview.mockRejectedValue(new Error('fail'));
        const result = await maybeRequestRoundReviewService(1, false);
        expect(result).toBe(false);
    });
});

describe('openStoreReviewService', () => {
    let openUrlSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequestReview.mockResolvedValue(undefined);
        openUrlSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
    });

    afterEach(() => {
        openUrlSpy.mockRestore();
    });

    it('opensStoreUrlWhenConfigured', async () => {
        mockStoreUrl.mockReturnValue('https://apps.apple.com/app/id123');

        await openStoreReviewService();

        expect(openUrlSpy).toHaveBeenCalledWith('https://apps.apple.com/app/id123');
        expect(mockRequestReview).not.toHaveBeenCalled();
    });

    it('fallsBackToNativePromptWhenNoStoreUrl', async () => {
        mockStoreUrl.mockReturnValue(null);

        await openStoreReviewService();

        expect(mockRequestReview).toHaveBeenCalled();
        expect(openUrlSpy).not.toHaveBeenCalled();
    });
});
