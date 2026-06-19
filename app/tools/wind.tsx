import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';
import { useOrientation } from '@/hooks/useOrientation';
import { useWind } from '@/hooks/useWind';
import WindDisplay from '@/components/WindDisplay';

export default function Wind() {
    const colours = useThemeColours();
    const styles = useStyles();
    const { landscapePadding } = useOrientation();
    const { wind, heading, refreshWind } = useWind();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        refreshWind();
    }, [refreshWind]);

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
                        <Text style={[styles.normalText, { margin: 5 }]}>
                            Point your phone at your target to read the wind
                        </Text>
                    </View>

                    <View style={[styles.container, { alignItems: 'center' }]}>
                        {wind ? (
                            <WindDisplay
                                directionFrom={wind.directionFrom}
                                speedMph={wind.speedMph}
                                heading={heading}
                            />
                        ) : (
                            <Text
                                testID="wind-tool-unavailable"
                                style={[styles.normalText, { textAlign: 'center', margin: 20 }]}
                            >
                                Wind data unavailable — check location permission and your connection
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
}
