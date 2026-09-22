import { useState, useCallback } from 'react';
import { RefreshControl, ScrollView, Text, View, Linking } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect } from 'expo-router';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';
import { useOrientation } from '@/hooks/useOrientation';
import { useWind } from '@/hooks/useWind';
import WindDisplay from '@/components/WindDisplay';
import CtaButton from '@/components/CtaButton';

export default function Wind() {
    const colours = useThemeColours();
    const styles = useStyles();
    const { landscapePadding } = useOrientation();
    const { wind, heading, refreshWind, locationIssue } = useWind();
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            refreshWind();
        }, [refreshWind])
    );

    const onRefresh = () => {
        setRefreshing(true);
        refreshWind();
        setRefreshing(false);
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colours.primary} />
                }
            >
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <Text style={[styles.headerText, styles.marginTop]}>
                            Wind
                        </Text>
                        <Text style={[styles.normalText, { margin: 5, textAlign: 'center' }]}>
                            Point your phone at your target to read the wind
                        </Text>
                    </View>

                    <View style={[styles.container, { alignItems: 'center' }]}>
                        {wind ? (
                            <WindDisplay
                                directionFrom={wind.directionFrom}
                                speedMph={wind.speedMph}
                                heading={heading}
                                compact
                                disableVoice
                            />
                        ) : locationIssue === 'servicesDisabled' ? (
                            <View style={{ alignItems: 'center', margin: 20 }}>
                                <Text
                                    testID="wind-tool-location-off"
                                    style={[styles.normalText, { textAlign: 'center', marginBottom: 16 }]}
                                >
                                    Location services are disabled. Enable them in your device settings to show wind data.
                                </Text>
                                <CtaButton
                                    testID="wind-open-settings-button"
                                    label="Open Settings"
                                    icon="settings"
                                    onPress={() => Linking.openSettings()}
                                />
                            </View>
                        ) : locationIssue === 'permissionDenied' ? (
                            <View style={{ alignItems: 'center', margin: 20 }}>
                                <Text
                                    testID="wind-tool-permission-denied"
                                    style={[styles.normalText, { textAlign: 'center', marginBottom: 16 }]}
                                >
                                    This app needs location permission to show wind data. Grant permission in your device settings.
                                </Text>
                                <CtaButton
                                    testID="wind-open-settings-button"
                                    label="Open Settings"
                                    icon="settings"
                                    onPress={() => Linking.openSettings()}
                                />
                            </View>
                        ) : (
                            <>
                                <View style={styles.divider} />

                                <Text
                                    testID="wind-tool-unavailable"
                                    style={[styles.normalText, { textAlign: 'center', margin: 20 }]}
                                >
                                    Wind data unavailable — check location permission and your connection
                                </Text>
                            </>

                        )}
                    </View>
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
}
