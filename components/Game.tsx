import colours from '@/assets/colours';
import styles from '@/assets/stlyes';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
    subHeading: string;
    games: any[];
};


export default function Game({ subHeading, games }: Props) {
    return (
        <View>
            <Text style={[styles.normalText, { margin: 5 }]}>
                {subHeading}
            </Text>

            {games.map((game, index) => (
                <View key={index} style={[styles.container, localStyles.wrapper]}>
                    <Text style={styles.subHeaderText}>
                        {game.header}
                    </Text>
                    <Text style={[styles.normalText, localStyles.contentText]}>
                        <Text style={styles.yellowText}>Objective:</Text> {game.objective}
                    </Text>
                    <Text style={[styles.normalText, localStyles.contentText]}>
                        <Text style={styles.yellowText}>Setup:</Text> {game.setup}
                    </Text>
                    <Text style={[styles.normalText, localStyles.contentText]}>
                        <Text style={styles.yellowText}>How to play:</Text> {game.howToPlay}
                    </Text>
                </View>
            ))}
        </View>
    )
};

const localStyles = StyleSheet.create({
    wrapper: {
        margin: 5,
        borderRadius: 10,
        borderColor: colours.border,
        borderWidth: 1,
    },
    contentText: {
        padding: 5,
        margin: 5,
    },
});
