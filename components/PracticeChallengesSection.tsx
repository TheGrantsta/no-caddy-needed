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

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            <Text style={[styles.subHeaderText, styles.marginTop]}>Challenges</Text>

            <View style={styles.navGrid}>
                <View style={styles.navRow}>
                    <Link href="../challenges/putting-simulation" style={styles.navCardLink}>
                        <View style={styles.navCard}>
                            <View style={styles.iconCircle}>
                                <MaterialIcons name="adjust" size={36} color={colours.white} />
                            </View>
                            <Text style={styles.navCardLabel}>Putting Simulation</Text>
                        </View>
                    </Link>
                </View>
                <View style={styles.navRow}>
                    <Link href="../challenges/up-and-down" style={styles.navCardLink}>
                        <View style={styles.navCard}>
                            <View style={styles.iconCircle}>
                                <MaterialIcons name="flag" size={36} color={colours.white} />
                            </View>
                            <Text style={styles.navCardLabel}>Up-and-Down</Text>
                        </View>
                    </Link>
                </View>
            </View>
        </Animated.View>
    );
}
