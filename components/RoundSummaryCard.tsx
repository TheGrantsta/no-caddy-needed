import React from 'react';
import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    holesPlayed: number;
    totalScore: number;
    totalPar: number;
    // Null when the round did not record putting (for example a score-only round)
    putts: number | null;
    threePutts: number;
    penalties: number;
};

// Saved round headline: the score against par, then putts, three-putts and penalties as tiles
export default function RoundSummaryCard({ holesPlayed, totalScore, totalPar, putts, threePutts, penalties }: Props) {
    const styles = useStyles();
    const s = styles.roundDetail;
    const difference = totalScore - totalPar;
    const toPar = difference === 0 ? 'Even par' : difference > 0 ? `${difference} over par` : `${Math.abs(difference)} under par`;

    const tiles = [
        { label: 'Putts', value: putts ?? '–' },
        { label: '3-putts', value: threePutts },
        { label: 'Penalties', value: penalties },
    ];

    return (
        <View testID="round-summary-card" style={s.summaryCard}>
            <Text style={s.summaryMeta}>{`You · ${holesPlayed} holes`}</Text>
            <View style={s.scoreRow}>
                <Text testID="round-summary-score" style={s.scoreText}>{String(totalScore)}</Text>
                <Text style={s.toParText}>{toPar}</Text>
            </View>
            <View style={s.tileRow}>
                {tiles.map(tile => (
                    <View key={tile.label} style={s.tile}>
                        <Text style={s.tileLabel}>{tile.label}</Text>
                        <Text style={s.tileValue}>{String(tile.value)}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
