import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import styles from '@/assets/stlyes';

type Props = {
    objective: string;
    setUp: string;
    howToPlay: string;
};
export default function Instructions({ objective, setUp, howToPlay }: Props) {
    return (
        <View>
            <Text style={[styles.normalText, localStyles.contentText]}>
                <Text style={styles.yellowText}>Objective:</Text> {objective}
            </Text>
            <Text style={[styles.normalText, localStyles.contentText]}>
                <Text style={styles.yellowText}>Setup:</Text> {setUp}
            </Text>
            <Text style={[styles.normalText, localStyles.contentText]}>
                <Text style={styles.yellowText}>How to play:</Text> {howToPlay}
            </Text>
        </View>
    )
};

const localStyles = StyleSheet.create({
    contentText: {
        padding: 5,
        margin: 5,
    },
});