import React from 'react';
import { Text, View } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';

interface Props {
    tempo: number;
}

export default function TempoDisplay({ tempo }: Props) {
    const colours = useThemeColours();
    const styles = useStyles();
    const localStyles = styles.tempoTool;

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'nowrap', flex: 1, alignContent: 'space-evenly' }}>
            <Text style={[localStyles.valueText, styles.normalText, { color: colours.primary, padding: 5 }]}>
                Beats per minute: {tempo}
            </Text>
        </View>
    );
}
