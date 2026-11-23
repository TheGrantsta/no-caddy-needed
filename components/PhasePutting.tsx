import React from 'react';
import { View } from 'react-native';
import PuttingStatsInput from './PuttingStatsInput';
import { DeadlySinsValues } from '../service/DbService';
import { PuttCount } from '../utils/puttingEntry';

interface Props {
    holePar: number;
    userScore?: number;
    deadlySinsValues: DeadlySinsValues;
    puttingStats: { firstPutt?: number; secondPutt?: number; secondIsLong: boolean; greenInRegulation: boolean } | null;
    puttingFirstPuttError: boolean;
    puttingSecondPuttError: boolean;
    puttingSecondPuttRequiredError: boolean;
    showPuttingInfo: boolean;
    onStatsChange: (firstPutt: number | undefined, secondPutt: number | undefined, secondIsLong: boolean, greenInRegulation: boolean) => void;
    onPuttCountChange: (count: PuttCount) => void;
    onErrorChange: (hasError: boolean) => void;
    onShowInfo: (show: boolean) => void;
}

export default function PhasePutting({
    holePar,
    userScore,
    deadlySinsValues,
    puttingStats,
    puttingFirstPuttError,
    onStatsChange,
    onPuttCountChange,
    onErrorChange,
}: Props) {
    return (
        <View>
            <PuttingStatsInput
                holePar={holePar}
                userScore={userScore}
                threePuttSelected={deadlySinsValues.threePutts}
                onStatsChange={onStatsChange}
                onPuttCountChange={onPuttCountChange}
                initialFirstPutt={puttingStats?.firstPutt}
                initialSecondPutt={puttingStats?.secondPutt}
                initialSecondIsLong={puttingStats?.secondIsLong ?? false}
                showFirstPuttError={puttingFirstPuttError}
                onSecondPuttErrorChange={onErrorChange}
            />
        </View>
    );
}
