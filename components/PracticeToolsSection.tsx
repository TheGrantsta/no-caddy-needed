import React from 'react';
import { Animated, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';

interface Props {
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
}

const TOOLS = [
    { label: 'Tempo', href: '../tools/tempo', icon: 'music-note' },
    { label: 'Random', href: '../tools/random', icon: 'casino' },
    { label: 'Reminders', href: '../tools/reminders', icon: 'notifications-none' },
    { label: 'Wind', href: '../tools/wind', icon: 'air' },
];

// Tool cards share the challenge card layout: a 2×2 grid of tiles with an icon, chevron and label
export default function PracticeToolsSection({ fadeAnim, slideAnim }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.practiceCards;

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            <View style={s.grid}>
                {TOOLS.map(tool => {
                    const slug = tool.href.split('/').pop() ?? '';
                    return (
                        <View key={tool.label} testID={`tool-slot-${slug}`} style={s.cardSlot}>
                            <Link href={tool.href} testID={`tool-link-${slug}`} style={s.cardLink}>
                                <View testID={`tool-card-${slug}`} style={s.card}>
                                    <View style={s.iconTile}>
                                        <MaterialIcons name={tool.icon as any} size={26} color={colours.primary} />
                                    </View>
                                    <View testID={`tool-chevron-${slug}`} style={s.chevron}>
                                        <MaterialIcons name="chevron-right" size={22} color={colours.tertiary} />
                                    </View>
                                    <Text style={s.cardLabel}>{tool.label}</Text>
                                </View>
                            </Link>
                        </View>
                    );
                })}
            </View>
        </Animated.View>
    );
}
