import React from 'react';
import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import type { QuickToolOption } from '@/utils/quickTools';

type Props = {
    option: QuickToolOption;
    // Prefixes the test IDs, e.g. "challenge" or "tool", so each section's cards stay distinct
    testIDPrefix: string;
};

// One tile on the Practice tab: an icon, a chevron and the label, linking to its challenge or tool
export default function PracticeCard({ option, testIDPrefix }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.practiceCards;
    const slug = option.slug;

    return (
        <View testID={`${testIDPrefix}-slot-${slug}`} style={s.cardSlot}>
            <Link href={option.href} testID={`${testIDPrefix}-link-${slug}`} style={s.cardLink}>
                <View testID={`${testIDPrefix}-card-${slug}`} style={s.card}>
                    <View style={s.iconTile}>
                        <MaterialIcons name={option.icon as any} size={26} color={colours.primary} />
                    </View>
                    <View testID={`${testIDPrefix}-chevron-${slug}`} style={s.chevron}>
                        <MaterialIcons name="chevron-right" size={22} color={colours.tertiary} />
                    </View>
                    <Text style={s.cardLabel}>{option.label}</Text>
                </View>
            </Link>
        </View>
    );
}
