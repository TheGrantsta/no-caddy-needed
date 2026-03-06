import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Instructions from './Instructions';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    header: string;
    objective: string;
    setUp: string;
    howToPlay: string;
    isActive?: boolean;
    onToggleActive?: (isActive: boolean) => void;
};

export default function Game({ header, objective, setUp, howToPlay, isActive, onToggleActive }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    const localStyles = useMemo(() => StyleSheet.create({
        toggleContainer: {
            width: 45,
            height: 15,
            borderRadius: 10,
            backgroundColor: colours.backgroundLight,
            justifyContent: 'center',
        },
        toggleOn: {
            backgroundColor: colours.yellow,
        },
        toggleCircle: {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: colours.backgroundLight,
            alignSelf: 'flex-start',
        },
        circleOn: {
            alignSelf: 'flex-end',
        },
    }), [colours]);

    return (
        <View style={{ padding: 8 }}>
            <Text style={styles.subHeaderText}>{header}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}>
                <Text style={[styles.normalText, { paddingRight: 10 }]}>
                    {(isActive ?? true) ? 'Active:' : 'Inactive:'}
                </Text>
                <TouchableOpacity
                    testID='game-active-toggle'
                    style={[localStyles.toggleContainer, (isActive ?? true) && localStyles.toggleOn, { marginRight: 10 }]}
                    onPress={() => onToggleActive?.(!(isActive ?? true))}>
                    <View style={[localStyles.toggleCircle, (isActive ?? true) && localStyles.circleOn]} />
                </TouchableOpacity>
            </View>
            <View>
                <Instructions objective={objective} setUp={setUp} howToPlay={howToPlay} />
            </View>
        </View>
    );
}
