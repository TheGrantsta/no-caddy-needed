import React from 'react';
import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

export default function WindHeader() {
    const styles = useStyles();

    return (
        <View style={styles.headerContainer}>
            <Text style={[styles.headerText, styles.marginTop]}>
                Wind
            </Text>
            <Text style={[styles.normalText, { margin: 5, textAlign: 'center' }]}>
                Point your phone at your target
            </Text>
        </View>
    );
}
