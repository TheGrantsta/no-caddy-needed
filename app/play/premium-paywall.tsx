import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import {
    getOfferings,
    purchasePremium,
    restorePurchases,
    SubscriptionOffering,
} from '../../service/SubscriptionService';

export default function PremiumPaywallScreen() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { roundId } = useLocalSearchParams<{ roundId: string }>();
    const router = useRouter();
    const toast = useToast();

    const [offerings, setOfferings] = useState<SubscriptionOffering[] | null>(null);
    const [purchasing, setPurchasing] = useState(false);
    const [restoring, setRestoring] = useState(false);

    useEffect(() => {
        getOfferings().then(setOfferings);
    }, []);

    const handleSubscribe = async () => {
        setPurchasing(true);
        try {
            const result = await purchasePremium();
            if (result.success) {
                router.push({ pathname: '/play/round-analysis', params: { roundId } });
            } else if (result.error !== 'cancelled') {
                toast.show('Something went wrong. Please try again.', { type: 'danger' });
            }
        } finally {
            setPurchasing(false);
        }
    };

    const handleRestore = async () => {
        setRestoring(true);
        try {
            const success = await restorePurchases();
            if (success) {
                router.push({ pathname: '/play/round-analysis', params: { roundId } });
            } else {
                toast.show('No previous purchases found', { type: 'danger' });
            }
        } finally {
            setRestoring(false);
        }
    };

    const isLoading = offerings === null;

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.contentSection}>
                    <Text style={[styles.headerText, localStyles.title]}>Analyse Your Round</Text>
                    <Text style={styles.normalText}>
                        Get personalised AI coaching after every round. Identify patterns in your game and receive targeted drill recommendations.
                    </Text>
                </View>

                {isLoading && (
                    <View style={[styles.container, styles.headerContainer]}>
                        <ActivityIndicator testID="paywall-loading" size="large" color={colours.primary} />
                    </View>
                )}

                {!isLoading && offerings!.length === 0 && (
                    <View style={styles.contentSection}>
                        <Text testID="paywall-no-offerings" style={styles.normalText}>
                            Subscription not available right now. Please try again later.
                        </Text>
                    </View>
                )}

                {!isLoading && offerings!.length > 0 && (
                    <View style={styles.contentSection}>
                        <Text style={[styles.normalText, localStyles.price]}>
                            {offerings![0].priceString}
                        </Text>
                    </View>
                )}

                {!isLoading && (
                    <>
                        <TouchableOpacity
                            testID="subscribe-button"
                            style={[styles.largeButton, { backgroundColor: colours.primary, marginBottom: 12 }]}
                            onPress={handleSubscribe}
                            disabled={purchasing || offerings!.length === 0}
                        >
                            <Text style={styles.buttonText}>
                                {purchasing ? 'Processing...' : 'Subscribe Now'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            testID="restore-purchase-button"
                            style={[styles.largeButton, { backgroundColor: colours.secondary }]}
                            onPress={handleRestore}
                            disabled={restoring}
                        >
                            <Text style={styles.buttonText}>
                                {restoring ? 'Restoring...' : 'Restore Purchase'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            testID="paywall-back-button"
                            style={localStyles.backButton}
                            onPress={() => router.back()}
                        >
                            <Text style={[styles.normalText, localStyles.backText]}>{'< Back'}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </GestureHandlerRootView>
    );
}

const localStyles = StyleSheet.create({
    title: {
        marginBottom: 12,
    },
    price: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 8,
    },
    backButton: {
        alignItems: 'center',
        paddingVertical: 16,
        marginTop: 8,
    },
    backText: {
        opacity: 0.7,
    },
});
