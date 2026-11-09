import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import type { WindEffect } from '@/service/WeatherService';
import { describeWindEffect } from '@/utils/windEffectDescription';

type Props = {
    effect: WindEffect;
};

// Card summarising how the wind changes the shot: headline, subtitle, and a row per wind component
const WindEffectCard = ({ effect }: Props) => {
    const styles = useStyles();
    const s = styles.windEffect;
    const description = describeWindEffect(effect);

    return (
        <View>
            <Text style={s.sectionLabel}>EFFECT ON YOUR SHOT</Text>
            <View testID="wind-effect-card" style={s.card}>
                <View style={s.headerRow}>
                    <View testID="wind-effect-icon" style={s.iconTile}>
                        <MaterialIcons name="air" size={24} color="#FFFFFF" />
                    </View>
                    <View style={s.headerText}>
                        <Text style={s.title}>{description.title}</Text>
                        {description.subtitle ? <Text style={s.subtitle}>{description.subtitle}</Text> : null}
                    </View>
                </View>
                {description.rows.map(row => (
                    <View key={row.label} style={s.row}>
                        <Text style={s.rowLabel}>{row.label}</Text>
                        <Text style={s.rowValue}>{row.value}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default WindEffectCard;
