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
    { label: 'Tempo', href: '../tools/tempo', icon: 'music-note' as const },
    { label: 'Random', href: '../tools/random', icon: 'shuffle-on' as const },
    { label: 'Reminders', href: '../tools/reminders', icon: 'notifications-none' as const },
    { label: 'Wind', href: '../tools/wind', icon: 'air' as const },
];

export default function PracticeToolsSection({ fadeAnim, slideAnim }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            <Text style={[styles.subHeaderText, styles.marginTop]}>
                Practice tools
            </Text>

            <View style={styles.navGrid}>
                {TOOLS.map((tool, idx) => (
                    idx % 2 === 0 && (
                        <View key={`row-${idx}`} style={styles.navRow}>
                            <Link href={tool.href} style={styles.navCardLink}>
                                <View style={styles.navCard}>
                                    <View style={styles.iconCircle}>
                                        <MaterialIcons name={tool.icon} size={36} color={colours.white} />
                                    </View>
                                    <Text style={styles.navCardLabel}>{tool.label}</Text>
                                </View>
                            </Link>
                            {idx + 1 < TOOLS.length && (
                                <Link href={TOOLS[idx + 1].href} style={styles.navCardLink}>
                                    <View style={styles.navCard}>
                                        <View style={styles.iconCircle}>
                                            <MaterialIcons name={TOOLS[idx + 1].icon} size={36} color={colours.white} />
                                        </View>
                                        <Text style={styles.navCardLabel}>{TOOLS[idx + 1].label}</Text>
                                    </View>
                                </Link>
                            )}
                        </View>
                    )
                ))}
            </View>
        </Animated.View>
    );
}
