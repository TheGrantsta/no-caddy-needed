import React from 'react';
import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

export default function HomeIntro() {
    const styles = useStyles();

    return (
        <View style={styles.contentSection}>
            <Text style={styles.headerText}>Be your own best caddy</Text>
            <Text style={styles.normalText}>
                Golf is not a game of perfect, or having a perfect swing
            </Text>
        </View>
    );
}
