import React from 'react';
import { Animated, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Chevrons from './Chevrons';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';

interface Props {
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
}

const PRINCIPLES = [
    'Deliberate: purposeful practice',
    'Variety: mix up your practice to keep it interesting & challenging',
    'Accountability: track progress & measure your performance',
    'Stress: practice under pressure',
    'Data: use your 7 Deadly Sins stats as a guide; focus your practice on what will make the biggest difference'
];

const AREAS = [
    { label: 'Putting', href: '../areas/putting', icon: 'adjust' as const },
    { label: 'Chipping', href: '../areas/chipping', icon: 'filter-tilt-shift' as const },
    { label: 'Pitching', href: '../areas/pitching', icon: 'golf-course' as const },
    { label: 'Bunker play', href: '../areas/bunker', icon: 'beach-access' as const },
    { label: 'Full swing', href: '../areas/full-swing', icon: 'sports-golf' as const },
];

export default function PracticeAreasSection({ fadeAnim, slideAnim }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            <Text style={[styles.subHeaderText, styles.marginTop]}>
                Practice areas
            </Text>

            <View style={styles.navGrid}>
                {AREAS.map((area, idx) => (
                    idx % 2 === 0 && (
                        <View key={`row-${idx}`} style={styles.navRow}>
                            <Link href={area.href} style={styles.navCardLink}>
                                <View style={styles.navCard}>
                                    <View style={styles.iconCircle}>
                                        <MaterialIcons name={area.icon} size={36} color={colours.white} />
                                    </View>
                                    <Text style={styles.navCardLabel}>{area.label}</Text>
                                </View>
                            </Link>
                            {idx + 1 < AREAS.length && (
                                <Link href={AREAS[idx + 1].href} style={styles.navCardLink}>
                                    <View style={styles.navCard}>
                                        <View style={styles.iconCircle}>
                                            <MaterialIcons name={AREAS[idx + 1].icon} size={36} color={colours.white} />
                                        </View>
                                        <Text style={styles.navCardLabel}>{AREAS[idx + 1].label}</Text>
                                    </View>
                                </Link>
                            )}
                        </View>
                    )
                ))}
            </View>

            <View style={styles.contentSection}>
                <Chevrons heading='Principles' points={PRINCIPLES} />
            </View>
        </Animated.View>
    );
}
