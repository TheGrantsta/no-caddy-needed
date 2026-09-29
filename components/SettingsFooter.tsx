import React from 'react';
import Constants from 'expo-constants';
import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import CtaButton from './CtaButton';

interface Props {
    onExportStats: () => void;
    onRateApp: () => void;
}

export default function SettingsFooter({ onExportStats, onRateApp }: Props) {
    const styles = useStyles();

    return (
        <>
            <View style={styles.contentSection}>
                <CtaButton
                    testID="export-stats-button"
                    label="Export my stats"
                    icon="ios-share"
                    onPress={onExportStats}
                />
            </View>

            <View style={styles.contentSection}>
                <CtaButton
                    testID="rate-app-button"
                    label="Rate my app"
                    icon="star"
                    onPress={onRateApp}
                />
            </View>

            <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 20 }}>
                <Text style={styles.normalText}>
                    Version {Constants.expoConfig?.version}
                </Text>
            </View>
        </>
    );
}
