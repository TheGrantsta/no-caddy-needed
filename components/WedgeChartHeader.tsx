import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';

interface Props {
    onInfoPress: () => void;
}

export default function WedgeChartHeader({ onInfoPress }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    return (
        <View style={styles.header}>
            <View style={styles.titleRow}>
                <TouchableOpacity
                    testID="info-button"
                    onPress={onInfoPress}
                >
                    <MaterialIcons name="info-outline" size={24} color={colours.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerText, styles.marginTop]}>Wedge chart</Text>
            </View>
            <Text style={[styles.normalText, styles.marginBottom]}>
                Wedge carry distances NOT total
            </Text>
        </View>
    );
}
