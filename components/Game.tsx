import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Instructions from './Instructions';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    subHeading: string;
    games: any[];
};


export default function Game({ subHeading, games }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    const localStyles = useMemo(() => StyleSheet.create({
        wrapper: {
            margin: 5,
            borderRadius: 10,
            borderColor: colours.border,
            borderWidth: 1,
        },
    }), [colours]);

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
