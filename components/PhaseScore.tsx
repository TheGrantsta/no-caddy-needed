import React from 'react';
import { View } from 'react-native';
import HoleScoreInput from './HoleScoreInput';
import HoleNoteInput from './HoleNoteInput';
import WindDisplay from './WindDisplay';

interface Props {
    holeNumber: number;
    holePar: number;
    scores: { playerId: number; playerName: string; score: number }[];
    noteText: string;
    courseName: string | null;
    wind?: { directionFrom?: string; speedMph?: number };
    onScoresChange: (holeNumber: number, holePar: number, scores: { playerId: number; playerName: string; score: number }[]) => void;
    onNoteChange: (text: string) => void;
}

export default function PhaseScore({
    holeNumber,
    holePar,
    scores,
    noteText,
    courseName,
    wind,
    onScoresChange,
    onNoteChange,
}: Props) {
    return (
        <View>
            <HoleScoreInput
                holeNumber={holeNumber}
                holePar={holePar}
                scores={scores}
                onScoresChange={(scores) => onScoresChange(holeNumber, holePar, scores)}
            />

            <HoleNoteInput
                courseHolePars={{ [holeNumber]: holePar }}
                courseNotes={{ [holeNumber]: noteText }}
                holeNumber={holeNumber}
                courseName={courseName}
                noteText={noteText}
                onNoteChange={onNoteChange}
            />

            {wind?.directionFrom && wind?.speedMph && (
                <View style={{ marginVertical: 12 }}>
                    <WindDisplay wind={wind} />
                </View>
            )}
        </View>
    );
}
