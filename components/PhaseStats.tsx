import React from 'react';
import { Text, View } from 'react-native';
import DeadlySinsTally from './DeadlySinsTally';
import { useStyles } from '../hooks/useStyles';
import { DeadlySinsValues, RoundPlayer } from '../service/DbService';

interface Props {
    holeNumber: number;
    holePar: number;
    sins: DeadlySinsValues;
    onSinsChange: (sins: DeadlySinsValues) => void;
    players?: RoundPlayer[];
    userScore?: number;
}

export default function PhaseStats({
    holeNumber,
    holePar,
    sins,
    onSinsChange,
    _players,
    userScore,
}: Props) {
    const styles = useStyles();

    return (
        <View>
            <View style={{ paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Text style={styles.normalText}>Hole {holeNumber} — Deadly Sins</Text>
            </View>
            <DeadlySinsTally
                holePar={holePar}
                deadlySinsValues={sins}
                onDeadlySinsChange={onSinsChange}
                onEndRound={() => { }}
                roundControlled={true}
                onValuesChange={onSinsChange}
                initialValues={sins}
                userScore={userScore}
            />
        </View>
    );
}
