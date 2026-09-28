import React from 'react';
import { View } from 'react-native';
import DeadlySinsTally from './DeadlySinsTally';
import { DeadlySinsValues } from '../service/DbService';

interface Props {
    holeNumber: number;
    holePar: number;
    sins: DeadlySinsValues;
    onSinsChange: (sins: DeadlySinsValues) => void;
}

export default function PhaseStats({
    holeNumber,
    holePar,
    sins,
    onSinsChange,
}: Props) {
    return (
        <View>
            <DeadlySinsTally
                holePar={holePar}
                deadlySinsValues={sins}
                onDeadlySinsChange={onSinsChange}
            />
        </View>
    );
}
