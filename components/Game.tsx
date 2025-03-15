import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Instructions from './Instructions';
import colours from '@/assets/colours';
import styles from '@/assets/stlyes';

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

                    <Instructions objective={game.objective} setUp={game.setup} howToPlay={game.howToPlay} />
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
});
