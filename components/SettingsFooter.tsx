import React from 'react';
import Constants from 'expo-constants';
import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import CtaButton from './CtaButton';

interface Props {
    onExportStats: () => void;
    exporting?: boolean;
    onRateApp: () => void;
}

export default function SettingsFooter({ onExportStats, onRateApp, exporting = false }: Props) {
    const styles = useStyles();

    return (
        <>
            <View style={styles.contentSection}>
                <CtaButton
                    testID="export-stats-button"
                    label={exporting ? 'Preparing export…' : 'Export stats for AI coaching'}
                    icon="ios-share"
                    onPress={onExportStats}
                    disabled={exporting}
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
