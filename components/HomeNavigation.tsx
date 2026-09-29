import React from 'react';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';

export default function HomeNavigation() {
    const styles = useStyles();
    const colours = useThemeColours();

    return (
        <View style={styles.navGrid}>
            <View style={styles.navRow}>
                <Link testID="home-play-link" href="/play" style={styles.navCardLink}>
                    <View style={styles.navCard}>
                        <View style={styles.iconCircle}>
                            <MaterialIcons name="sports-golf" size={36} color={colours.white} />
                        </View>
                        <Text style={styles.navCardLabel}>Play</Text>
                    </View>
                </Link>
            </View>
            <View style={styles.navRow}>
                <Link testID="home-practice-link" href="/practice" style={styles.navCardLink}>
                    <View style={styles.navCard}>
                        <View style={styles.iconCircle}>
                            <MaterialIcons name="golf-course" size={36} color={colours.white} />
                        </View>
                        <Text style={styles.navCardLabel}>Practice</Text>
                    </View>
                </Link>
                <Link testID="home-perform-link" href="/perform" style={styles.navCardLink}>
                    <View style={styles.navCard}>
                        <View style={styles.iconCircle}>
                            <MaterialIcons name="lightbulb" size={36} color={colours.white} />
                        </View>
                        <Text style={styles.navCardLabel}>Performance</Text>
                    </View>
                </Link>
            </View>
        </View>
    );
}
