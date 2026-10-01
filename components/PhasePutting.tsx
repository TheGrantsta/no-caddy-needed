import React from 'react';
import { View } from 'react-native';
import PuttingStatsInput from './PuttingStatsInput';
import { DeadlySinsValues } from '../service/DbService';

interface Props {
    holePar: number;
    deadlySinsValues: DeadlySinsValues;
    puttingStats: { firstPutt?: number; secondPutt?: number; secondIsLong: boolean } | null;
    puttingFirstPuttError: boolean;
    puttingSecondPuttError: boolean;
    puttingSecondPuttRequiredError: boolean;
    showPuttingInfo: boolean;
    onStatsChange: (firstPutt: number | undefined, secondPutt: number | undefined, secondIsLong: boolean) => void;
    onErrorChange: (hasError: boolean) => void;
    onShowInfo: (show: boolean) => void;
}

export default function PhasePutting({
    holePar,
    deadlySinsValues,
    puttingStats,
    puttingFirstPuttError,
    _puttingSecondPuttError,
    puttingSecondPuttRequiredError,
    _showPuttingInfo,
    onStatsChange,
    onErrorChange,
    _onShowInfo,
}: Props) {
    return (
        <View>
            <PuttingStatsInput
                holePar={holePar}
                threePuttSelected={deadlySinsValues.threePutts}
                onStatsChange={onStatsChange}
                initialFirstPutt={puttingStats?.firstPutt}
                initialSecondPutt={puttingStats?.secondPutt}
                initialSecondIsLong={puttingStats?.secondIsLong ?? false}
                showFirstPuttError={puttingFirstPuttError}
                showSecondPuttRequiredError={puttingSecondPuttRequiredError}
                onSecondPuttErrorChange={onErrorChange}
            />
        </View>
    );
}
