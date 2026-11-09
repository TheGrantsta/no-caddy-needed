import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { DeadlySinsValues } from '../service/DbService';
import CtaButton from './CtaButton';

type Props = {
    onEndRound: (values: DeadlySinsValues) => void;
    onRoundStateChange?: (active: boolean) => void;
    roundControlled?: boolean;
    onValuesChange?: (values: DeadlySinsValues) => void;
    holePar?: number;
    userScore?: number;
    initialValues?: Partial<DeadlySinsValues>;
    // Content shown directly under a sin's row while that sin is marked (e.g. the club used off the tee)
    renderFollowUp?: (slug: string) => ReactNode;
};

const INITIAL_SINS: DeadlySinsValues = {
    threePutts: false,
    doubleBogeys: false,
    bogeysPar5: false,
    bogeysInside9Iron: false,
    doubleChips: false,
    troubleOffTee: false,
    penalties: false,
};

const sinFields: { slug: string; label: string; key: keyof DeadlySinsValues }[] = [
    { slug: 'trouble-off-tee', label: 'Trouble off tee', key: 'troubleOffTee' },
    { slug: 'penalties', label: 'Penalties', key: 'penalties' },
    { slug: 'three-putts', label: '3-putts', key: 'threePutts' },
    { slug: 'bogeys-inside-9iron', label: 'Bogeys inside 9-iron', key: 'bogeysInside9Iron' },
    { slug: 'double-chips', label: 'Double chips', key: 'doubleChips' },
    { slug: 'double-bogeys', label: 'Double bogeys', key: 'doubleBogeys' },
    { slug: 'bogeys-par5', label: 'Bogeys on par 5s', key: 'bogeysPar5' },
];

const DeadlySinsTally = ({ onEndRound, onRoundStateChange, roundControlled, onValuesChange, holePar, userScore, initialValues, renderFollowUp }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.deadlySinsTally;
    const [roundActive, setRoundActive] = useState(roundControlled === true);
    const [values, setValues] = useState<DeadlySinsValues>({
        threePutts: initialValues?.threePutts ?? false,
        doubleBogeys: initialValues?.doubleBogeys ?? false,
        bogeysPar5: initialValues?.bogeysPar5 ?? false,
        bogeysInside9Iron: initialValues?.bogeysInside9Iron ?? false,
        doubleChips: initialValues?.doubleChips ?? false,
        troubleOffTee: initialValues?.troubleOffTee ?? false,
        penalties: initialValues?.penalties ?? false,
    });
    const isAutoDoubleBogey = holePar !== undefined && userScore !== undefined && userScore >= holePar + 2;
    const isAutoBogeyPar5 = holePar === 5 && userScore !== undefined && userScore >= 6;

    useEffect(() => {
        // Mirrors the auto-set sins from the entered score; the state is intentionally synced from props
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValues(prev => {
            const nextDoubleBogeys = isAutoDoubleBogey ? true : false;
            const nextBogeysPar5 = isAutoBogeyPar5 ? true : false;
            if (prev.doubleBogeys === nextDoubleBogeys && prev.bogeysPar5 === nextBogeysPar5) return prev;
            const next = { ...prev, doubleBogeys: nextDoubleBogeys, bogeysPar5: nextBogeysPar5 };
            onValuesChange?.(next);
            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAutoDoubleBogey, isAutoBogeyPar5]);

    // Rows shown on this hole: bogeys on par 5s only on a par 5, double bogeys only when auto-selected
    const visibleSinFields = sinFields.filter(field => {
        if (field.slug === 'bogeys-par5') return holePar === 5;
        if (field.slug === 'double-bogeys') return isAutoDoubleBogey;
        return true;
    });

    const handleToggle = useCallback((key: keyof DeadlySinsValues) => {
        const next = { ...values, [key]: !values[key] };
        setValues(next);
        onValuesChange?.(next);
    }, [values, onValuesChange]);

    const handleStartRound = () => {
        setRoundActive(true);
        onRoundStateChange?.(true);
    };

    const handleEndRound = () => {
        onEndRound(values);
        setValues(INITIAL_SINS);
        setRoundActive(false);
        onRoundStateChange?.(false);
    };

    if (!roundActive) {
        return (
            <View style={s.container}>
                <CtaButton
                    testID="7deadly-sins-start-round"
                    label="Start round"
                    icon="play-arrow"
                    onPress={handleStartRound}
                />
            </View>
        );
    }

    return (
        <View>
            <View style={s.headerRow}>
                <Text style={s.sectionLabel}>Deadly Sins</Text>
            </View>
            <View testID="deadly-sins-card" style={s.card}>
                {visibleSinFields.map((field, index) => {
                    const divider = index > 0 ? s.rowDivider : null;
                    if (field.slug === 'bogeys-par5' && isAutoBogeyPar5) {
                        return (
                            <View key={field.slug} testID="7deadly-sins-auto-row-bogeys-par5" style={[s.row, divider]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.label}>{field.label}</Text>
                                    <Text style={s.autoCaption}>Auto: 6 or more on a par 5</Text>
                                </View>
                                <View style={s.controls} pointerEvents="none">
                                    <Switch testID="7deadly-sins-auto-bogeys-par5" value disabled trackColor={{ false: colours.tertiary, true: colours.red }} />
                                </View>
                            </View>
                        );
                    }
                    if (field.slug === 'double-bogeys') {
                        return (
                            <View key={field.slug} testID="7deadly-sins-auto-row-double-bogeys" style={[s.row, divider]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.label}>{field.label}</Text>
                                    <Text style={s.autoCaption}>Auto: 2 or more over par</Text>
                                </View>
                                <View style={s.controls} pointerEvents="none">
                                    <Switch testID="7deadly-sins-auto-double-bogeys" value disabled trackColor={{ false: colours.tertiary, true: colours.red }} />
                                </View>
                            </View>
                        );
                    }
                    const followUp = values[field.key] ? renderFollowUp?.(field.slug) : null;
                    return (
                        <View key={field.slug}>
                            <TouchableOpacity
                                testID={`7deadly-sins-toggle-${field.slug}`}
                                onPress={() => handleToggle(field.key)}
                                activeOpacity={0.6}
                                style={[s.tappableRow, divider]}
                            >
                                <Text style={[s.label, values[field.key] && s.labelMarked]}>{field.label}</Text>
                                <View style={s.controls}>
                                    <View style={s.controls} pointerEvents="none">
                                        <Switch
                                            testID={`7deadly-sins-indicator-${field.slug}`}
                                            value={values[field.key]}
                                            trackColor={{ false: colours.tertiary, true: colours.primary }}
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
                            {followUp ? <View testID={`7deadly-sins-follow-up-${field.slug}`} style={s.followUp}>{followUp}</View> : null}
                        </View>
                    );
                })}
            </View>

                {!roundControlled && (
                    <CtaButton
                        testID="7deadly-sins-end-round"
                        label="End round"
                        icon="flag"
                        onPress={handleEndRound}
                    />
                )}
        </View>
    );
};

export default DeadlySinsTally;
