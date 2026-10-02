import React from 'react';
import { Animated, ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';

interface DrillItem {
    Name: string;
    Score?: number;
    Created_At: string;
}

interface Props {
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
    loading: boolean;
    allDrillHistory: DrillItem[];
    displayedDrillHistory: DrillItem[];
    isLoadingMore: boolean;
    onLoadMore: () => void;
}

export default function DrillHistorySection({
    fadeAnim,
    slideAnim,
    loading,
    allDrillHistory,
    displayedDrillHistory,
    isLoadingMore,
    onLoadMore,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            {loading ? (
                <View>
                    <ActivityIndicator size="large" color={colours.primary} />
                </View>
            ) : (
                <View>
                    {allDrillHistory.length === 0 && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.normalText}>
                                No challenge history yet
                            </Text>
                        </>
                    )}

                    {allDrillHistory.length > 0 && (
                        <View>
                            <View style={{ flexDirection: 'row', paddingHorizontal: 10, marginBottom: 10, marginTop: 10 }}>
                                <Text style={[styles.subHeaderText, { flex: 0.6 }]} numberOfLines={1}>
                                    Challenge
                                </Text>
                                <Text style={[styles.subHeaderText, { flex: 0.2, textAlign: 'center' }]} numberOfLines={1}>
                                    Score
                                </Text>
                                <Text style={[styles.subHeaderText, { flex: 0.2, textAlign: 'center' }]} numberOfLines={1}>
                                    Date
                                </Text>
                            </View>

                            {displayedDrillHistory.map((item, index) => {
                                const formattedScore = item.Score !== undefined
                                    ? item.Name === 'Up-and-Down Challenge'
                                        ? `${item.Score}%`
                                        : String(item.Score)
                                    : '—';

                                return (
                                    <View key={index} style={{ flexDirection: 'row', paddingHorizontal: 10, marginBottom: 8 }}>
                                        <Text style={[styles.cell, { textAlign: 'left', flex: 0.6, borderWidth: 0, fontWeight: 'normal' }]} numberOfLines={1}>
                                            {item.Name}
                                        </Text>
                                        <Text style={[styles.cell, { flex: 0.2, borderWidth: 0, textAlign: 'center', fontWeight: 'normal' }]} numberOfLines={1}>
                                            {formattedScore}
                                        </Text>
                                        <Text style={[styles.cell, { flex: 0.2, borderWidth: 0, textAlign: 'center', fontWeight: 'normal' }]} numberOfLines={1}>
                                            {item.Created_At}
                                        </Text>
                                    </View>
                                );
                            })}

                            {displayedDrillHistory.length < allDrillHistory.length && (
                                <View style={{ paddingVertical: 15, alignItems: 'center', gap: 10 }}>
                                    {isLoadingMore && (
                                        <ActivityIndicator
                                            testID="infinite-scroll-loader"
                                            size="small"
                                            color={colours.primary}
                                        />
                                    )}
                                    <TouchableOpacity
                                        testID="load-more-button"
                                        style={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 10,
                                            borderWidth: 1,
                                            borderColor: colours.primary,
                                            borderRadius: 8,
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            columnGap: 8,
                                        }}
                                        onPress={onLoadMore}
                                        disabled={isLoadingMore}
                                    >
                                        <MaterialIcons name="expand-more" size={20} color={colours.primary} />
                                        <Text style={{ color: colours.primary, fontSize: 14, fontWeight: '500' }}>
                                            {isLoadingMore ? 'Loading...' : 'Load more'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            )}
        </Animated.View>
    );
}
