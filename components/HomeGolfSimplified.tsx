import React from 'react';
import { View } from 'react-native';
import Chevrons from './Chevrons';
import { useStyles } from '@/hooks/useStyles';

export default function HomeGolfSimplified() {
    const styles = useStyles();
    const points = ['Enjoyment: golf is a game', 'Method: hit it, find it, hit it again', 'Objective: get the ball in the hole with the fewest shots'];

    return (
        <View style={styles.contentSection}>
            <Chevrons heading="Golf, simplified" points={points} />
        </View>
    );
}
