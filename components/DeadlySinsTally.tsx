import { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { DeadlySinsValues } from '../service/DbService';

type Props = {
    onEndRound: (values: DeadlySinsValues) => void;
    onRoundStateChange?: (active: boolean) => void;
    roundControlled?: boolean;
    onValuesChange?: (values: DeadlySinsValues) => void;
    holePar?: number;
    userScore?: number;
    initialValues?: Partial<DeadlySinsValues>;
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

const DeadlySinsTally = ({ onEndRound, onRoundStateChange, roundControlled, onValuesChange, holePar, userScore, initialValues }: Props) => {
    const styles = useStyles();
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
    const [isOpen, setIsOpen] = useState(true);

    const handleToggle = useCallback((key: keyof DeadlySinsValues) => {
        const next = { ...values, [key]: !values[key] };
        setValues(next);
        onValuesChange?.(next);
    }, [values, onValuesChange]);

    const handleStartRound = () => {
        setRoundActive(true);
        setIsOpen(true);
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

            {isOpen && sinFields.map((field) => {
                if (field.slug === 'bogeys-par5' && holePar !== 5) return null;
                if (field.slug === 'double-bogeys' && (holePar === undefined || userScore === undefined || userScore < holePar + 2)) return null;
                return (
                    <View key={field.slug} style={s.row}>
                        <Text style={s.label}>{field.label}</Text>
                        <View style={s.controls}>
                            <TouchableOpacity
                                testID={`7deadly-sins-toggle-${field.slug}`}
                                onPress={() => handleToggle(field.key)}
                                style={s.button}
                            >
                                <Text style={s.buttonText}>{values[field.key] ? '✓' : '○'}</Text>
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
