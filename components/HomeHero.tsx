import React from 'react';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

// Green hero card with the tagline and a button to start a round
export default function HomeHero() {
    const styles = useStyles();
    const colours = useThemeColours();
    const router = useRouter();
    const s = styles.homeCards;

    return (
        <View style={s.hero}>
            <Text style={s.heroTitle}>Be your own best caddy</Text>
            <Text style={s.heroBody}>Golf is not a game of perfect, or having a perfect swing</Text>
            <TouchableOpacity
                testID="home-start-round"
                accessibilityRole="button"
                onPress={() => router.push('/play')}
                style={s.heroButton}
            >
                <MaterialIcons name="play-arrow" size={22} color={colours.primary} />
                <Text style={s.heroButtonText}>Start a round</Text>
            </TouchableOpacity>
        </View>
    );
}
