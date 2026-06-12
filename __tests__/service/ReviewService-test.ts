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

    it('returnsFalseWhenNoRoundsCompleted', async () => {
        const result = await maybeRequestRoundReviewService(0);
        expect(result).toBe(false);
        expect(mockRequestReview).not.toHaveBeenCalled();
    });

    it('requestsReviewAfterTheFirstRound', async () => {
        const result = await maybeRequestRoundReviewService(1);
        expect(mockRequestReview).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('requestsReviewEverySixthRoundAfterTheFirst', async () => {
        expect(await maybeRequestRoundReviewService(7)).toBe(true);
        expect(await maybeRequestRoundReviewService(13)).toBe(true);
        expect(await maybeRequestRoundReviewService(19)).toBe(true);
    });

    it('doesNotRequestReviewOnInterveningRounds', async () => {
        for (const count of [2, 3, 4, 5, 6, 8, 12]) {
            mockRequestReview.mockClear();
            expect(await maybeRequestRoundReviewService(count)).toBe(false);
            expect(mockRequestReview).not.toHaveBeenCalled();
        }
    });

    it('returnsFalseWhenStoreReviewUnavailable', async () => {
        mockIsAvailable.mockResolvedValue(false);
        const result = await maybeRequestRoundReviewService(1);
        expect(mockRequestReview).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it('returnsFalseWhenRequestReviewThrows', async () => {
        mockRequestReview.mockRejectedValue(new Error('fail'));
        const result = await maybeRequestRoundReviewService(1);
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
