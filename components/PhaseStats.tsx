import React from 'react';
import { View } from 'react-native';
import DeadlySinsTally from './DeadlySinsTally';
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
    _holeNumber,
    holePar,
    sins,
    onSinsChange,
    _players,
    userScore,
}: Props) {
    return (
        <View>
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
