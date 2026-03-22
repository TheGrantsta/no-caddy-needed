import { useCallback, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type InitialValues = {
    threePutts: number;
    doubleBogeys: number;
    bogeysPar5: number;
    bogeysInside9Iron: number;
    doubleChips: number;
    troubleOffTee: number;
    penalties: number;
};

type Props = {
    onEndRound: (threePutts: number, doubleBogeys: number, bogeysPar5: number, bogeysInside9Iron: number, doubleChips: number, troubleOffTee: number, penalties: number) => void;
    onRoundStateChange?: (active: boolean) => void;
    roundControlled?: boolean;
    onValuesChange?: (threePutts: number, doubleBogeys: number, bogeysPar5: number, bogeysInside9Iron: number, doubleChips: number, troubleOffTee: number, penalties: number) => void;
    holePar?: number;
    userScore?: number;
    initialValues?: InitialValues;
};

const counters = [
    { slug: 'trouble-off-tee', label: 'Trouble off tee' },
    { slug: 'penalties', label: 'Penalties' },
    { slug: 'three-putts', label: '3-putts' },
    { slug: 'bogeys-inside-9iron', label: 'Bogeys inside 9-iron' },
    { slug: 'double-chips', label: 'Double chips' },
    { slug: 'double-bogeys', label: 'Double bogeys' },
    { slug: 'bogeys-par5', label: 'Bogeys on par 5s' },
];

const DeadlySinsTally = ({ onEndRound, onRoundStateChange, roundControlled, onValuesChange, holePar, userScore, initialValues }: Props) => {
    const styles = useStyles();
    const s = styles.deadlySinsTally;
    const [roundActive, setRoundActive] = useState(roundControlled === true);
    const [threePutts, setThreePutts] = useState(() => initialValues?.threePutts ?? 0);
    const [doubleBogeys, setDoubleBogeys] = useState(() => initialValues?.doubleBogeys ?? 0);
    const [bogeysPar5, setBogeysPar5] = useState(() => initialValues?.bogeysPar5 ?? 0);
    const [bogeysInside9Iron, setBogeysInside9Iron] = useState(() => initialValues?.bogeysInside9Iron ?? 0);
    const [doubleChips, setDoubleChips] = useState(() => initialValues?.doubleChips ?? 0);
    const [troubleOffTee, setTroubleOffTee] = useState(() => initialValues?.troubleOffTee ?? 0);
    const [penalties, setPenalties] = useState(() => initialValues?.penalties ?? 0);
    const [isOpen, setIsOpen] = useState(true);

    // Order matches counters array: troubleOffTee, penalties, threePutts, bogeysInside9Iron, doubleChips, doubleBogeys, bogeysPar5
    const values = useMemo(
        () => [troubleOffTee, penalties, threePutts, bogeysInside9Iron, doubleChips, doubleBogeys, bogeysPar5],
        [troubleOffTee, penalties, threePutts, bogeysInside9Iron, doubleChips, doubleBogeys, bogeysPar5]
    );
    const setters = useMemo(
        () => [setTroubleOffTee, setPenalties, setThreePutts, setBogeysInside9Iron, setDoubleChips, setDoubleBogeys, setBogeysPar5],
        []
    );

    const notifyValuesChange = useCallback((newValues: number[]) => {
        if (onValuesChange) {
            // Pass in callback signature order: (threePutts, doubleBogeys, bogeysPar5, bogeysInside9Iron, doubleChips, troubleOffTee, penalties)
            onValuesChange(newValues[2], newValues[5], newValues[6], newValues[3], newValues[4], newValues[0], newValues[1]);
        }
    }, [onValuesChange]);

    const handleIncrement = useCallback((index: number) => {
        const newValue = values[index] + 1;
        setters[index](newValue);
        const newValues = [...values];
        newValues[index] = newValue;
        notifyValuesChange(newValues);
    }, [values, setters, notifyValuesChange]);

    const handleDecrement = useCallback((index: number) => {
        const newValue = Math.max(0, values[index] - 1);
        setters[index](newValue);
        const newValues = [...values];
        newValues[index] = newValue;
        notifyValuesChange(newValues);
    }, [values, setters, notifyValuesChange]);

    const handleStartRound = () => {
        setRoundActive(true);
        setIsOpen(true);
        onRoundStateChange?.(true);
    };

    const handleEndRound = () => {
        onEndRound(threePutts, doubleBogeys, bogeysPar5, bogeysInside9Iron, doubleChips, troubleOffTee, penalties);
        setThreePutts(0);
        setDoubleBogeys(0);
        setBogeysPar5(0);
        setBogeysInside9Iron(0);
        setDoubleChips(0);
        setTroubleOffTee(0);
        setPenalties(0);
        setRoundActive(false);
        onRoundStateChange?.(false);
    };

    if (!roundActive) {
        return (
            <View style={s.container}>
                <TouchableOpacity testID="7deadly-sins-start-round" onPress={handleStartRound} style={s.saveButton}>
                    <Text style={s.saveButtonText}>Start round</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={s.container}>
            <TouchableOpacity
                testID="7deadly-sins-toggle"
                onPress={() => setIsOpen(prev => !prev)}
                style={s.toggleHeader}
            >
                <Text style={s.toggleLabel}>7 Deadly Sins</Text>
                <Text style={s.chevron}>{isOpen ? '▾' : '▴'}</Text>
            </TouchableOpacity>

            {isOpen && counters.map((counter, index) => {
                if (counter.slug === 'bogeys-par5' && holePar !== 5) return null;
                if (counter.slug === 'double-bogeys' && (holePar === undefined || userScore === undefined || userScore < holePar + 2)) return null;
                return (
                    <View key={counter.slug} style={s.row}>
                        <Text style={s.label}>{counter.label}</Text>
                        <View style={s.controls}>
                            <TouchableOpacity
                                testID={`7deadly-sins-decrement-${counter.slug}`}
                                onPress={() => handleDecrement(index)}
                                style={s.button}
                            >
                                <Text style={s.buttonText}>-</Text>
                            </TouchableOpacity>
                            <Text testID={`7deadly-sins-count-${counter.slug}`} style={s.count}>
                                {values[index]}
                            </Text>
                            <TouchableOpacity
                                testID={`7deadly-sins-increment-${counter.slug}`}
                                onPress={() => handleIncrement(index)}
                                style={s.button}
                            >
                                <Text style={s.buttonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            })}

            {!roundControlled && (
                <TouchableOpacity testID="7deadly-sins-end-round" onPress={handleEndRound} style={s.saveButton}>
                    <Text style={s.saveButtonText}>End round</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default DeadlySinsTally;
