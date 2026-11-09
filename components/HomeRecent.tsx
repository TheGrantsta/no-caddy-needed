import React from 'react';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import type { RecentItem } from '@/utils/homeRecent';

type Props = {
    items: RecentItem[];
};

// The latest rounds and practice drills, newest first, each linking to where it can be reviewed
export default function HomeRecent({ items }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.homeCards;

    return (
        <View>
            <Text style={s.sectionLabel}>RECENT</Text>
            <View style={s.recentCard}>
                {items.length === 0 && <Text style={s.recentEmpty}>Nothing recent yet</Text>}
                {items.map((item, index) => (
                    <Link key={`${item.href}-${index}`} testID={`home-recent-row-${index}`} href={item.href} style={s.recentLink}>
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
                    </Link>
                ))}
            </View>
        </View>
    );
}
