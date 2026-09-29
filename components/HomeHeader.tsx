import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';

interface Props {
    onInfoPress: () => void;
}

export default function HomeHeader({ onInfoPress }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    return (
        <View style={styles.header}>
            <View style={styles.titleRow}>
                <TouchableOpacity testID="info-button" onPress={onInfoPress}>
                    <MaterialIcons name="info-outline" size={26} color={colours.primary} />
                </TouchableOpacity>
                <Text style={styles.titleText}>No caddy needed!</Text>
            </View>
            <Text style={styles.subtitleText}>Smarter play & practice</Text>
        </View>
    );
}
