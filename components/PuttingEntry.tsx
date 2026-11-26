import { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';
import PuttWheel from './PuttWheel';
import { DEFAULT_FIRST_PUTT_FEET, DEFAULT_SECOND_PUTT_FEET, PuttCount } from '../utils/puttingEntry';

const MAX_DISTANCE_FEET = 100;

export type PuttingEntryValue = {
    putts: PuttCount;
    firstPutt: number;
    secondPutt: number;
    secondIsLong: boolean;
};

type Props = {
    putts: PuttCount | undefined;
    firstPutt: number | undefined;
    secondPutt: number | undefined;
    secondIsLong: boolean;
    onChange: (value: PuttingEntryValue) => void;
    // A short second putt that does not finish short of the first putt
    secondPuttError?: boolean;
    // Shown when the user has not yet chosen how many putts
    showRequiredError?: boolean;
};

const COUNT_OPTIONS: { count: PuttCount; label: string }[] = [
    { count: 0, label: '0' },
    { count: 1, label: '1' },
    { count: 2, label: '2' },
    { count: 3, label: '3+' },
];

// The putting section of a hole: how many putts, then the distances that apply to that count.
// Only one distance wheel is open at a time; tapping a value again closes it.
export default function PuttingEntry({ putts, firstPutt, secondPutt, secondIsLong, onChange, secondPuttError = false, showRequiredError = false }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.holeScreen;
    const [openWheel, setOpenWheel] = useState<'first' | 'second' | null>(null);
    // A spinning wheel reports each value it passes. It closes once the value has stopped changing for this long.
    const SETTLE_MS = 500;
    const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cancelSettle = () => {
        if (settleTimer.current) clearTimeout(settleTimer.current);
        settleTimer.current = null;
    };

    useEffect(() => cancelSettle, []);

    const first = firstPutt ?? DEFAULT_FIRST_PUTT_FEET;
    const second = secondPutt ?? DEFAULT_SECOND_PUTT_FEET;

    const emit = (changes: Partial<PuttingEntryValue>) => {
        const next = { putts, firstPutt: first, secondPutt: second, secondIsLong, ...changes };
        if (next.putts === undefined) return;
        onChange(next as PuttingEntryValue);
    };

    const choosePutts = (count: PuttCount) => {
        if (count === 0) {
            cancelSettle();
            setOpenWheel(null);
        }
        emit({ putts: count });
    };

    // Choosing a distance selects it straight away; its wheel closes once the spin has settled
    const chooseDistance = (wheel: 'first' | 'second', feet: number) => {
        emit(wheel === 'first' ? { firstPutt: feet } : { secondPutt: feet });
        cancelSettle();
        settleTimer.current = setTimeout(() => {
            settleTimer.current = null;
            setOpenWheel(null);
        }, SETTLE_MS);
    };

    const toggleWheel = (wheel: 'first' | 'second') => {
        cancelSettle();
        setOpenWheel(current => (current === wheel ? null : wheel));
    };

    const valueBoxStyle = (open: boolean) => [
        { minWidth: 96, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center' as const, backgroundColor: open ? colours.primary + '1F' : colours.tertiary + '26' },
    ];
    const valueTextStyle = (open: boolean) => ({ color: open ? colours.primary : colours.black, fontSize: fontSizes.normal, fontWeight: 'bold' as const });

    const errorText = (text: string, testID: string) => (
        <Text testID={testID} style={{ color: colours.errorText, fontSize: fontSizes.smallText, paddingHorizontal: 16, paddingBottom: 8 }}>
            {text}
        </Text>
    );

    const hasDistances = putts !== undefined && putts >= 1;
    const hasSecondPutt = putts !== undefined && putts >= 2;

    return (
        <View>
            <View style={s.puttRow}>
                <Text style={s.puttLabel}>Putts</Text>
                <View style={s.segment}>
                    {COUNT_OPTIONS.map(option => {
                        const active = putts === option.count;
                        return (
                            <TouchableOpacity
                                key={option.count}
                                testID={`putts-option-${option.count}`}
                                accessibilityRole="button"
                                onPress={() => choosePutts(option.count)}
                                style={[s.segmentOption, active && s.segmentOptionActive]}
                            >
                                <Text style={[s.segmentText, active && s.segmentTextActive]}>{option.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
            {showRequiredError && errorText('Choose the number of putts', 'putts-required-error')}

            {putts === 0 && (
                <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                    <Text testID="chip-in-text" style={{ color: colours.black, fontSize: fontSizes.normal }}>Holed from off the green</Text>
                </View>
            )}

            {hasDistances && (
                <>
                    <View style={s.rowDivider} />
                    <View style={s.puttRow}>
                        <Text testID="first-putt-label" style={s.puttLabel}>{putts === 1 ? 'Holed from' : '1st putt from'}</Text>
                        <TouchableOpacity testID="first-putt-value" accessibilityRole="button" onPress={() => toggleWheel('first')} style={valueBoxStyle(openWheel === 'first')}>
                            <Text style={valueTextStyle(openWheel === 'first')}>{`${first} ft`}</Text>
                        </TouchableOpacity>
                    </View>
                    {openWheel === 'first' && (
                        <PuttWheel testID="first-putt-wheel" value={first} max={MAX_DISTANCE_FEET} onChange={feet => chooseDistance('first', feet)} />
                    )}
                </>
            )}

            {hasSecondPutt && (
                <>
                    <View style={s.rowDivider} />
                    <View style={s.puttRow}>
                        <Text testID="second-putt-label" style={s.puttLabel}>2nd putt from</Text>
                        <TouchableOpacity testID="second-putt-value" accessibilityRole="button" onPress={() => toggleWheel('second')} style={valueBoxStyle(openWheel === 'second')}>
                            <Text style={valueTextStyle(openWheel === 'second')}>{`${second} ft`}</Text>
                        </TouchableOpacity>
                    </View>
                    {openWheel === 'second' && (
                        <PuttWheel testID="second-putt-wheel" value={second} max={MAX_DISTANCE_FEET} onChange={feet => chooseDistance('second', feet)} />
                    )}
                    <View style={s.rowDivider} />
                    <View style={s.puttRow}>
                        <Text style={s.puttLabel}>1st putt finished</Text>
                        <View style={s.segment}>
                            <TouchableOpacity
                                testID="finished-short"
                                accessibilityRole="button"
                                onPress={() => emit({ secondIsLong: false })}
                                style={[s.segmentOption, !secondIsLong && s.segmentOptionActive]}
                            >
                                <Text style={[s.segmentText, !secondIsLong && s.segmentTextActive]}>Short</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                testID="finished-long"
                                accessibilityRole="button"
                                onPress={() => emit({ secondIsLong: true })}
                                style={[s.segmentOption, secondIsLong && s.segmentOptionActive]}
                            >
                                <Text style={[s.segmentText, secondIsLong && s.segmentTextActive]}>Long</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {secondPuttError && errorText('Short second putt must be shorter than first putt', 'second-putt-error')}
                </>
            )}
        </View>
    );
}
