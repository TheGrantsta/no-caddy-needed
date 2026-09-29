import React from 'react';
import { Linking, Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import CtaButton from './CtaButton';

type LocationIssue = 'servicesDisabled' | 'permissionDenied' | null | string;

interface Props {
    locationIssue: LocationIssue;
}

export default function WindUnavailable({ locationIssue }: Props) {
    const styles = useStyles();

    if (locationIssue === 'servicesDisabled') {
        return (
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
        );
    }

    if (locationIssue === 'permissionDenied') {
        return (
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
        );
    }

    return (
        <Text
            testID="wind-tool-unavailable"
            style={[styles.normalText, { textAlign: 'center', margin: 20 }]}
        >
            Wind data unavailable — check location permission and your connection
        </Text>
    );
}
