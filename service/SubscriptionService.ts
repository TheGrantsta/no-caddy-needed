import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { logError } from './FirebaseService';

export const PREMIUM_ENTITLEMENT_ID = 'No caddy needed Pro';

export type PurchaseResult = {
    success: boolean;
    error?: string;
};

export type SubscriptionOffering = {
    packageIdentifier: string;
    productIdentifier: string;
    priceString: string;
    title: string;
};

export async function initializeRevenueCat(): Promise<void> {
    const apiKey = Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
        : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

    if (!apiKey) {
        return;
    }

    try {
        await Purchases.setLogLevel(LOG_LEVEL.WARN);
        Purchases.configure({ apiKey });
    } catch (error: any) {
        logError('subscription/initialize', error?.message ?? 'RevenueCat initialization failed');
    }
}

export async function checkPremiumEntitlement(): Promise<boolean> {
    try {
        const customerInfo = await Purchases.getCustomerInfo();
        return PREMIUM_ENTITLEMENT_ID in customerInfo.entitlements.active;
    } catch (error: any) {
        logError('subscription/check-entitlement', error?.message ?? 'Failed to check entitlement');
        return false;
    }
}

export async function purchasePremium(): Promise<PurchaseResult> {
    try {
        const offerings = await Purchases.getOfferings();
        const currentOffering = offerings.current;

        if (!currentOffering || currentOffering.availablePackages.length === 0) {
            logError('subscription/purchase', 'No subscription available');
            return { success: false, error: 'No subscription available' };
        }

        const packageToPurchase = currentOffering.availablePackages[0];
        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

        if (PREMIUM_ENTITLEMENT_ID in customerInfo.entitlements.active) {
            return { success: true };
        }

        logError('subscription/purchase', 'Purchase completed but entitlement not activated');
        return { success: false, error: 'Purchase completed but entitlement not activated' };
    } catch (error: any) {
        if (error?.userCancelled) {
            return { success: false, error: 'cancelled' };
        }
        logError('subscription/purchase', error?.message ?? 'Purchase failed');
        return { success: false, error: error?.message ?? 'Purchase failed' };
    }
}

export async function restorePurchases(): Promise<boolean> {
    try {
        const customerInfo = await Purchases.restorePurchases();
        return PREMIUM_ENTITLEMENT_ID in customerInfo.entitlements.active;
    } catch (error: any) {
        logError('subscription/restore', error?.message ?? 'Restore failed');
        return false;
    }
}

export async function getOfferings(): Promise<SubscriptionOffering[]> {
    try {
        const offerings = await Purchases.getOfferings();
        const current = offerings.current;

        if (!current || current.availablePackages.length === 0) {
            return [];
        }

        return current.availablePackages.map(pkg => ({
            packageIdentifier: pkg.identifier,
            productIdentifier: pkg.product.productIdentifier,
            priceString: pkg.product.priceString,
            title: pkg.product.title,
        }));
    } catch (error: any) {
        logError('subscription/get-offerings', error?.message ?? 'Failed to load offerings');
        return [];
    }
}
