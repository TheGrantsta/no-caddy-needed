import React from 'react';
import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { getWindArrowRotation, getWindEffect } from '@/service/WeatherService';
import { describeWindEffect } from '@/utils/windEffectDescription';
import WindDial from './WindDial';

type Props = {
    directionFrom: number;
    speedMph: number;
    heading: number;
};

// Pop-up above the hole bar: the wind dial and how the wind changes the shot
const WindPopover = ({ directionFrom, speedMph, heading }: Props) => {
    const styles = useStyles();
    const s = styles.windPopover;

    const description = describeWindEffect(getWindEffect(directionFrom, speedMph, heading));
    const summary = description.rows.length > 0
        ? description.rows.map(row => `${row.label} ${row.value}`).join(' · ')
        : description.subtitle;

    return (
        <View testID="wind-popover">
            <View style={s.card}>
                <WindDial rotation={getWindArrowRotation(directionFrom, heading)} speedMph={speedMph} />
                <Text testID="wind-popover-title" style={s.title}>{description.title}</Text>
                <Text testID="wind-popover-summary" style={s.summary}>{summary}</Text>
            </View>
            <View style={s.pointer} />
        </View>
    );
};

export default WindPopover;
