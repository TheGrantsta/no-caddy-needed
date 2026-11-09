import { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect, useRouter } from 'expo-router';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';
import { useOrientation } from '@/hooks/useOrientation';
import { useWind } from '@/hooks/useWind';
import { useFakeRefresh } from '@/hooks/useFakeRefresh';
import { getWindArrowRotation, getWindEffect } from '@/service/WeatherService';
import PageHeader from '@/components/PageHeader';
import WindDial from '@/components/WindDial';
import WindEffectCard from '@/components/WindEffectCard';
import WindUnavailable from '@/components/WindUnavailable';

export default function Wind() {
    const colours = useThemeColours();
    const styles = useStyles();
    const router = useRouter();
    const { landscapePadding } = useOrientation();
    const { wind, heading, refreshWind, locationIssue } = useWind();

    useFocusEffect(
        useCallback(() => {
            refreshWind();
        }, [refreshWind])
    );

    const { refreshing, onRefresh } = useFakeRefresh(() => refreshWind());

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colours.primary} />
                }
            >
                <PageHeader
                    title="Wind"
                    subtitle="Point your phone at your target"
                    onBack={() => router.back()}
                />

                {wind ? (
                    <>
                        <View style={styles.windDial.card}>
                            <WindDial
                                rotation={getWindArrowRotation(wind.directionFrom, heading)}
                                speedMph={wind.speedMph}
                            />
                        </View>

                        <WindEffectCard effect={getWindEffect(wind.directionFrom, wind.speedMph, heading)} />
                    </>
                ) : (
                    <View style={[styles.container, { alignItems: 'center', paddingHorizontal: 16 }]}>
                        <WindUnavailable locationIssue={locationIssue} />
                    </View>
                )}
            </ScrollView>
        </GestureHandlerRootView>
    );
}
