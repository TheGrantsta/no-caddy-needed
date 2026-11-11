import fontSizes from '@/assets/font-sizes';
import React from 'react';
import { Animated, Text, View } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { getUpAndDownRateService } from '../service/DbService';

interface Props {
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
    filteredRoundIds?: Set<number>;
}

export default function UpAndDownSection({
    fadeAnim,
    slideAnim,
    filteredRoundIds,
}: Props) {
    const styles = useStyles();
    const { rate, upAndDowns, attempts } = getUpAndDownRateService(filteredRoundIds);

    // Only show once there are missed greens, so the empty putting screen is unchanged
    if (attempts === 0) return null;

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View testID="up-and-down-card" style={styles.deadlySinsChart.card}>
                <Text style={[styles.subHeaderText, { padding: 0 }]}>Up & down</Text>
                <View style={{ alignItems: 'center', marginTop: 12 }}>
                    <Text testID="up-and-down-rate" style={[styles.normalText, { fontSize: fontSizes.header, fontWeight: 'bold' }]}>{rate}</Text>
                    <Text testID="up-and-down-detail" style={[styles.normalText, { marginTop: 4 }]}>{`${upAndDowns} of ${attempts} missed greens`}</Text>
                    <Text style={[styles.smallText, { textAlign: 'center', marginTop: 8 }]}>
                        One putt after missing the green
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
}
