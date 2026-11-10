import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';

interface Props {
    currentHole: number;
    isLastHole: boolean;
    onPreviousHole: () => Promise<void>;
    onNextHole: () => Promise<void>;
}

// The floating hole bar: previous hole on the left, next hole on the right
export default function HoleNavigationControls({
    currentHole,
    isLastHole,
    onPreviousHole,
    onNextHole,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const localStyles = styles.playScreen;

    return (
        <View testID="hole-nav-bar" style={styles.holeScreen.bottomBar}>
            <View style={localStyles.holeBarRow}>
                {currentHole > 1 ? (
                    <TouchableOpacity testID="previous-hole-button" onPress={onPreviousHole} style={localStyles.holeBarPrevious}>
                        <MaterialIcons name="chevron-left" size={18} color={colours.primary} />
                        <Text numberOfLines={1} style={localStyles.holeBarPreviousText}>{`Hole ${currentHole - 1}`}</Text>
                    </TouchableOpacity>
                ) : <View />}
                <View testID="hole-nav-right-group" style={localStyles.holeBarRightGroup}>
                    <TouchableOpacity
                        testID="next-hole-button"
                        onPress={onNextHole}
                        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                        style={[localStyles.nextHoleButton, localStyles.holeBarNextButton]}
                    >
                        <Text numberOfLines={1} style={[localStyles.nextHoleButtonText, localStyles.holeBarNextText]}>
                            {isLastHole ? 'Finish' : `Hole ${currentHole + 1}`}
                        </Text>
                        <MaterialIcons
                            name={isLastHole ? 'sports-score' : 'chevron-right'}
                            size={16}
                            color={colours.white}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
