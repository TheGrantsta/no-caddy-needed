import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

export const PREMIUM_ENTITLEMENT_ID = 'premium';

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

    await Purchases.setLogLevel(LOG_LEVEL.WARN);
    Purchases.configure({ apiKey });
}

export async function checkPremiumEntitlement(): Promise<boolean> {
    try {
        const customerInfo = await Purchases.getCustomerInfo();
        return PREMIUM_ENTITLEMENT_ID in customerInfo.entitlements.active;
    } catch {
        return false;
    }
}

export async function purchasePremium(): Promise<PurchaseResult> {
    try {
        const offerings = await Purchases.getOfferings();
        const currentOffering = offerings.current;

        if (!currentOffering || currentOffering.availablePackages.length === 0) {
            return { success: false, error: 'No subscription available' };
        }

        const packageToPurchase = currentOffering.availablePackages[0];
        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

        if (PREMIUM_ENTITLEMENT_ID in customerInfo.entitlements.active) {
            return { success: true };
        }

        return { success: false, error: 'Purchase completed but entitlement not activated' };
    } catch (error: any) {
        if (error?.userCancelled) {
            return { success: false, error: 'cancelled' };
        }
        return { success: false, error: error?.message ?? 'Purchase failed' };
    }
}

export async function restorePurchases(): Promise<boolean> {
    try {
        const customerInfo = await Purchases.restorePurchases();
        return PREMIUM_ENTITLEMENT_ID in customerInfo.entitlements.active;
    } catch {
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
    } catch {
        return [];
    }
}
