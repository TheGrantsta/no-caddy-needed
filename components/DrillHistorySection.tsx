import React from 'react';
import { Animated, ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';
import { describeDrill, formatDrillDate, groupDrillsByWeek } from '../utils/drillHistory';

interface DrillItem {
    Name: string;
    Score?: number;
    Created_At: string;
    // Full timestamp used for grouping and dates; Created_At is a display-only day and month
    Timestamp?: string;
}

interface Props {
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
    loading: boolean;
    loadFailed?: boolean;
    allDrillHistory: DrillItem[];
    displayedDrillHistory: DrillItem[];
    isLoadingMore: boolean;
    onLoadMore: () => void;
}

export default function DrillHistorySection({
    fadeAnim,
    slideAnim,
    loading,
    loadFailed = false,
    allDrillHistory,
    displayedDrillHistory,
    isLoadingMore,
    onLoadMore,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.drillHistory;
    const now = new Date();
    const dated = (items: DrillItem[]) => items.map(item => ({ ...item, Created_At: item.Timestamp ?? item.Created_At }));
    const { thisWeek, previously } = groupDrillsByWeek(dated(displayedDrillHistory), now);

    const renderGroup = (label: string, items: DrillItem[]) => {
        if (items.length === 0) return null;
        return (
            <View key={label}>
                <Text style={s.groupLabel}>{label}</Text>
                <View style={s.groupCard}>
                    {items.map((item, index) => {
                        const { label: challenge, icon } = describeDrill(item.Name);
                        const isRate = item.Name === 'Up-and-down Challenge';
                        const formattedScore = item.Score !== undefined
                            ? isRate ? `${item.Score}%` : String(item.Score)
                            : '—';
                        return (
                            <View key={`${item.Created_At}-${index}`} style={[s.row, index > 0 && s.rowDivider]}>
                                <View style={s.iconTile}>
                                    <MaterialIcons name={icon as any} size={24} color={colours.primary} />
                                </View>
                                <View style={s.rowText}>
                                    <Text style={s.rowName}>{challenge}</Text>
                                    <Text style={s.rowDate}>{formatDrillDate(item.Created_At, now)}</Text>
                                </View>
                                <View style={s.scoreBlock}>
                                    <Text style={s.scoreValue}>{formattedScore}</Text>
                                    {item.Score !== undefined && (
                                        <Text style={s.scoreCaption}>{isRate ? 'rate' : 'score'}</Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

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
                                {loadFailed ? "Couldn't load your history. Pull down to try again." : 'No challenge history yet'}
                            </Text>
                        </>
                    )}

                    {allDrillHistory.length > 0 && (
                        <View>
                            {renderGroup('THIS WEEK', thisWeek)}
                            {renderGroup('PREVIOUSLY', previously)}

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
