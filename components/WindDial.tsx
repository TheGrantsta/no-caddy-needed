import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    // Degrees clockwise from the target (top) to the direction the wind blows towards
    rotation: number;
    speedMph: number;
};

// Number of tick marks around the dial, including the target position at the top
const TICK_COUNT = 8;

// Compass dial: target marker at the top, tick marks around the edge, and a needle that
// points where the wind is blowing, with the speed in the centre
const WindDial = ({ rotation, speedMph }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.windDial;

    // Tick 0 is the target at the top, so the ticks run from 1 to the last position
    const ticks = Array.from({ length: TICK_COUNT - 1 }, (_, i) => i + 1);

    return (
        <View style={s.container}>
            <View style={s.targetRow}>
                <MaterialIcons name="flag" size={18} color={colours.primary} />
                <Text style={s.targetText}>TARGET</Text>
            </View>
            <View style={s.dial}>
                {ticks.map(index => (
                    <View
                        key={index}
                        testID={`wind-dial-tick-${index}`}
                        style={[s.rotor, { transform: [{ rotate: `${index * (360 / TICK_COUNT)}deg` }] }]}
                    >
                        <View style={s.tick} />
                    </View>
                ))}
                <View testID="wind-dial-target" style={s.targetMarker}>
                    <View style={s.targetArrow} />
                    <View style={s.targetStem} />
                </View>
                <View testID="wind-arrow-large" style={[s.rotor, { transform: [{ rotate: `${rotation}deg` }] }]}>
                    <View style={s.needleHead} />
                    <View style={s.needleShaft} />
                    <View style={s.needleTail} />
                </View>
                <View style={s.centre}>
                    <Text testID="wind-speed-value" style={s.speedValue}>{Math.round(speedMph)}</Text>
                    <Text testID="wind-speed-unit" style={s.speedUnit}>mph</Text>
                </View>
            </View>
        </View>
    );
};

export default WindDial;
