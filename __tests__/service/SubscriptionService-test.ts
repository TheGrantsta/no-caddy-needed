import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import {
    initializeRevenueCat,
    checkPremiumEntitlement,
    purchasePremium,
    restorePurchases,
    getOfferings,
    PREMIUM_ENTITLEMENT_ID,
} from '../../service/SubscriptionService';

jest.mock('react-native-purchases', () => ({
    __esModule: true,
    default: {
        configure: jest.fn(),
        getCustomerInfo: jest.fn(),
        purchasePackage: jest.fn(),
        restorePurchases: jest.fn(),
        getOfferings: jest.fn(),
    },
}));

const mockConfigure = Purchases.configure as jest.Mock;
const mockGetCustomerInfo = Purchases.getCustomerInfo as jest.Mock;
const mockPurchasePackage = Purchases.purchasePackage as jest.Mock;
const mockRestorePurchases = Purchases.restorePurchases as jest.Mock;
const mockGetOfferings = Purchases.getOfferings as jest.Mock;

const makeCustomerInfo = (hasPremium: boolean) => ({
    entitlements: {
        active: hasPremium
            ? { [PREMIUM_ENTITLEMENT_ID]: { isActive: true } }
            : {},
    },
});

const makeOfferings = (packages: object[]) => ({
    current: {
        availablePackages: packages,
    },
});

const makePackage = (identifier: string, priceString: string, title: string, productIdentifier: string) => ({
    identifier,
    product: {
        priceString,
        title,
        productIdentifier,
    },
});

describe('SubscriptionService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    describe('initializeRevenueCat', () => {
        it('calls configure with iOS key on iOS', async () => {
            jest.replaceProperty(Platform, 'OS', 'ios');
            process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY = 'ios-key-123';
            process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY = 'android-key-456';

            await initializeRevenueCat();

            expect(mockConfigure).toHaveBeenCalledWith({ apiKey: 'ios-key-123' });
        });

        it('calls configure with Android key on Android', async () => {
            jest.replaceProperty(Platform, 'OS', 'android');
            process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY = 'ios-key-123';
            process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY = 'android-key-456';

            await initializeRevenueCat();

            expect(mockConfigure).toHaveBeenCalledWith({ apiKey: 'android-key-456' });
        });

        it('does not throw when API key env var is missing', async () => {
            jest.replaceProperty(Platform, 'OS', 'ios');
            delete process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;

            await expect(initializeRevenueCat()).resolves.not.toThrow();
        });
    });

    describe('checkPremiumEntitlement', () => {
        it('returns true when premium entitlement is active', async () => {
            mockGetCustomerInfo.mockResolvedValue(makeCustomerInfo(true));

            const result = await checkPremiumEntitlement();

            expect(result).toBe(true);
        });

        it('returns false when premium entitlement is absent', async () => {
            mockGetCustomerInfo.mockResolvedValue(makeCustomerInfo(false));

            const result = await checkPremiumEntitlement();

            expect(result).toBe(false);
        });

        it('returns false when getCustomerInfo throws', async () => {
            mockGetCustomerInfo.mockRejectedValue(new Error('Network error'));

            const result = await checkPremiumEntitlement();

            expect(result).toBe(false);
        });
    });

    describe('purchasePremium', () => {
        const mockPackage = makePackage('$rc_monthly', '£2.99 / month', 'Premium Monthly', 'com.app.premium.monthly');

        it('returns success true when purchase completes with active entitlement', async () => {
            mockGetOfferings.mockResolvedValue(makeOfferings([mockPackage]));
            mockPurchasePackage.mockResolvedValue({ customerInfo: makeCustomerInfo(true) });

            const result = await purchasePremium();

            expect(result).toEqual({ success: true });
        });

        it('returns success false with error when purchase completes but entitlement not active', async () => {
            mockGetOfferings.mockResolvedValue(makeOfferings([mockPackage]));
            mockPurchasePackage.mockResolvedValue({ customerInfo: makeCustomerInfo(false) });

            const result = await purchasePremium();

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('returns cancelled error when user cancels purchase', async () => {
            mockGetOfferings.mockResolvedValue(makeOfferings([mockPackage]));
            const cancelError = Object.assign(new Error('Purchase cancelled'), { userCancelled: true });
            mockPurchasePackage.mockRejectedValue(cancelError);

            const result = await purchasePremium();

            expect(result).toEqual({ success: false, error: 'cancelled' });
        });

        it('returns error message when purchase fails for non-cancellation reason', async () => {
            mockGetOfferings.mockResolvedValue(makeOfferings([mockPackage]));
            mockPurchasePackage.mockRejectedValue(new Error('Payment declined'));

            const result = await purchasePremium();

            expect(result.success).toBe(false);
            expect(result.error).toBe('Payment declined');
        });

        it('returns error when no offerings are available', async () => {
            mockGetOfferings.mockResolvedValue({ current: null });

            const result = await purchasePremium();

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('restorePurchases', () => {
        it('returns true when restored customer info has active entitlement', async () => {
            mockRestorePurchases.mockResolvedValue(makeCustomerInfo(true));

            const result = await restorePurchases();

            expect(result).toBe(true);
        });

        it('returns false when restored customer info has no entitlement', async () => {
            mockRestorePurchases.mockResolvedValue(makeCustomerInfo(false));

            const result = await restorePurchases();

            expect(result).toBe(false);
        });

        it('returns false when restorePurchases throws', async () => {
            mockRestorePurchases.mockRejectedValue(new Error('Restore failed'));

            const result = await restorePurchases();

            expect(result).toBe(false);
        });
    });

    describe('getOfferings', () => {
        it('returns mapped SubscriptionOffering array from available packages', async () => {
            mockGetOfferings.mockResolvedValue(makeOfferings([
                makePackage('$rc_monthly', '£2.99 / month', 'Premium Monthly', 'com.app.premium.monthly'),
                makePackage('$rc_annual', '£19.99 / year', 'Premium Annual', 'com.app.premium.annual'),
            ]));

            const result = await getOfferings();

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                packageIdentifier: '$rc_monthly',
                productIdentifier: 'com.app.premium.monthly',
                priceString: '£2.99 / month',
                title: 'Premium Monthly',
            });
            expect(result[1]).toEqual({
                packageIdentifier: '$rc_annual',
                productIdentifier: 'com.app.premium.annual',
                priceString: '£19.99 / year',
                title: 'Premium Annual',
            });
        });

        it('returns empty array when no current offering exists', async () => {
            mockGetOfferings.mockResolvedValue({ current: null });

            const result = await getOfferings();

            expect(result).toEqual([]);
        });

        it('returns empty array when current offering has no packages', async () => {
            mockGetOfferings.mockResolvedValue(makeOfferings([]));

            const result = await getOfferings();

            expect(result).toEqual([]);
        });

        it('returns empty array when getOfferings throws', async () => {
            mockGetOfferings.mockRejectedValue(new Error('Network error'));

            const result = await getOfferings();

            expect(result).toEqual([]);
        });
    });
});
