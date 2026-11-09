import React from 'react';
import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

// Title and tagline for the Home page; the settings button lives in the tab header
export default function HomeHeader() {
    const styles = useStyles();

    return (
        <View style={styles.header}>
            <Text style={styles.titleText}>No caddy needed!</Text>
            <Text style={styles.subtitleText}>Smarter play & practice</Text>
        </View>
    );
}
