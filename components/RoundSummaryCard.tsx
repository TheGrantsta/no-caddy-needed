import React from 'react';
import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    holesPlayed: number;
    totalScore: number;
    totalPar: number;
    // Null when the round did not record putting (for example a score-only round)
    putts: number | null;
    threePutts: number;
    penalties: number;
    // Up-and-down rate for the round, shown as a stat tile
    upAndDown?: string;
    // Score-only rounds record no stats, so the tiles are hidden
    showStats?: boolean;
};

// Saved round headline: the score against par, then putts, three-putts and penalties as tiles
export default function RoundSummaryCard({ holesPlayed, totalScore, totalPar, putts, threePutts, penalties, upAndDown, showStats = true }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.roundDetail;
    const difference = totalScore - totalPar;
    const toPar = difference === 0 ? 'Even par' : difference > 0 ? `+${difference}` : `-${Math.abs(difference)}`;

    const tiles = [
        { label: 'Putts', value: putts ?? '–' },
        { label: '3-putts', value: threePutts },
        { label: 'Penalties', value: penalties },
        { label: 'Up & down', value: upAndDown ?? '-' },
    ];

    return (
        <View testID="round-summary-card" style={s.summaryCard}>
            <Text style={s.summaryMeta}>{`You · ${holesPlayed} holes`}</Text>
            <View style={s.scoreRow}>
                <Text testID="round-summary-score" style={s.scoreText}>{String(totalScore)}</Text>
                <Text style={[s.toParText, difference < 0 && { color: colours.red }]}>{toPar}</Text>
            </View>
            {showStats && (
                <View testID="round-summary-tile-row" style={s.tileRow}>
                    {tiles.map(tile => (
                        <View key={tile.label} testID={`round-summary-tile-${tile.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} style={s.tile}>
                            <Text style={s.tileLabel}>{tile.label}</Text>
                            <Text style={s.tileValue}>{String(tile.value)}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}
