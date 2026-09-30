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

export default function PracticeChallengesSection({ fadeAnim, slideAnim }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    const challenges = [
        { href: '../challenges/putting-simulation', icon: 'adjust', label: 'Putting Simulation' },
        { href: '../challenges/up-and-down', icon: 'flag', label: 'Up-and-Down' },
        { href: '../challenges/short-putting-ladder', icon: 'stairs', label: 'Short-Putting Ladder' },
        { href: '../challenges/lag-putting', icon: 'trending-up', label: 'Lag Putting' },
    ];

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            <Text style={[styles.subHeaderText, styles.marginTop]}>Challenges</Text>

            <View style={styles.navGrid}>
                {[0, 2].map((startIdx) => (
                    <View key={`row-${startIdx}`} style={styles.navRow}>
                        {challenges.slice(startIdx, startIdx + 2).map((challenge) => (
                            <Link key={challenge.label} href={challenge.href} style={styles.navCardLink}>
                                <View style={styles.navCard}>
                                    <View style={styles.iconCircle}>
                                        <MaterialIcons name={challenge.icon as any} size={36} color={colours.white} />
                                    </View>
                                    <Text style={styles.navCardLabel}>{challenge.label}</Text>
                                </View>
                            </Link>
                        ))}
                    </View>
                ))}
            </View>
        </Animated.View>
    );
}
