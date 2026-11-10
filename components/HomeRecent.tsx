import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import type { RecentItem } from '@/utils/homeRecent';

type Props = {
    items: RecentItem[];
};

// The latest rounds, newest first. Each opens its scorecard on top of the Stats round list,
// so going back lands on the list.
export default function HomeRecent({ items }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const router = useRouter();
    const s = styles.homeCards;

    const open = (item: RecentItem) => {
        router.navigate('/perform');
        router.push({ pathname: '/play/scorecard', params: { roundId: String(item.roundId) } });
    };

    return (
        <View>
            <Text style={s.sectionLabel}>RECENT</Text>
            <View style={s.recentCard}>
                {items.length === 0 && <Text style={s.recentEmpty}>Nothing recent yet</Text>}
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={`${item.href}-${index}`}
                        testID={`home-recent-row-${index}`}
                        accessibilityRole="button"
                        onPress={() => open(item)}
                        style={s.recentLink}
                    >
                        <View style={[s.recentRow, index > 0 && s.recentRowDivider]}>
                            <View style={s.recentIconTile}>
                                <MaterialIcons name={item.icon as any} size={22} color={colours.primary} />
                            </View>
                            <View style={s.recentText}>
                                <Text style={s.recentTitle}>{item.title}</Text>
                                <Text style={s.recentSubtitle}>{item.subtitle}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={22} color={colours.tertiary} />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
