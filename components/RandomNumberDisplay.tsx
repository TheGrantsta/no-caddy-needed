import React from 'react';
import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

interface Props {
    randomNumber: number;
}

export default function RandomNumberDisplay({ randomNumber }: Props) {
    const styles = useStyles();
    const localStyles = styles.randomTool;

    if (randomNumber <= 0) {
        return null;
    }

    return (
        <View style={localStyles.randomNumberContainer}>
            <Text style={localStyles.randomNumberText}>
                {randomNumber}
            </Text>
        </View>
    );
}
