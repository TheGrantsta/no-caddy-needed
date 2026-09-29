import { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect } from 'expo-router';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';
import { useOrientation } from '@/hooks/useOrientation';
import { useWind } from '@/hooks/useWind';
import { useFakeRefresh } from '@/hooks/useFakeRefresh';
import WindHeader from '@/components/WindHeader';
import WindDisplay from '@/components/WindDisplay';
import WindUnavailable from '@/components/WindUnavailable';

export default function Wind() {
    const colours = useThemeColours();
    const styles = useStyles();
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
                <View style={styles.container}>
                    <WindHeader />

                    <View style={[styles.container, { alignItems: 'center', paddingHorizontal: 16 }]}>
                        {wind ? (
                            <WindDisplay
                                directionFrom={wind.directionFrom}
                                speedMph={wind.speedMph}
                                heading={heading}
                                compact
                                disableVoice
                            />
                        ) : (
                            <WindUnavailable locationIssue={locationIssue} />
                        )}
                    </View>
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
}
