import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColours } from '../context/ThemeContext';
import fontSizes from '../assets/font-sizes';

type Props = {
    onEndRound: (threePutts: number, doubleBogeys: number, bogeysPar5: number, bogeysInside9Iron: number, doubleChips: number, troubleOffTee: number, penalties: number) => void;
    onRoundStateChange?: (active: boolean) => void;
    roundControlled?: boolean;
    onValuesChange?: (threePutts: number, doubleBogeys: number, bogeysPar5: number, bogeysInside9Iron: number, doubleChips: number, troubleOffTee: number, penalties: number) => void;
    holePar?: number;
    userScore?: number;
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

const DeadlySinsTally = ({ onEndRound, onRoundStateChange, roundControlled, onValuesChange, holePar, userScore }: Props) => {
    const colours = useThemeColours();
    const [roundActive, setRoundActive] = useState(roundControlled === true);
    const [threePutts, setThreePutts] = useState(0);
    const [doubleBogeys, setDoubleBogeys] = useState(0);
    const [bogeysPar5, setBogeysPar5] = useState(0);
    const [bogeysInside9Iron, setBogeysInside9Iron] = useState(0);
    const [doubleChips, setDoubleChips] = useState(0);
    const [troubleOffTee, setTroubleOffTee] = useState(0);
    const [penalties, setPenalties] = useState(0);
    const [isOpen, setIsOpen] = useState(true);

    const values = [threePutts, doubleBogeys, bogeysPar5, bogeysInside9Iron, doubleChips, troubleOffTee, penalties];
    const setters = [setThreePutts, setDoubleBogeys, setBogeysPar5, setBogeysInside9Iron, setDoubleChips, setTroubleOffTee, setPenalties];

    const localStyles = useMemo(() => StyleSheet.create({
        container: {
            paddingTop: 5,
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 20,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 6,
            borderBottomWidth: 0.5,
            borderColor: colours.yellow,
        },
        label: {
            color: colours.text,
            fontSize: fontSizes.smallText,
            flex: 1,
        },
        controls: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        button: {
            backgroundColor: colours.yellow,
            width: 24,
            height: 24,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
        },
        buttonText: {
            color: colours.background,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold',
        },
        count: {
            color: colours.text,
            fontSize: fontSizes.subHeader,
            minWidth: 40,
            textAlign: 'center',
        },
        saveButton: {
            backgroundColor: colours.yellow,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 5,
        },
        saveButtonText: {
            color: colours.background,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold',
        },
        toggleHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 8,
            borderBottomWidth: 0.5,
            borderColor: colours.yellow,
        },
        toggleLabel: {
            color: colours.text,
            fontSize: fontSizes.smallText,
            fontWeight: 'bold',
        },
        chevron: {
            color: colours.yellow,
            fontSize: fontSizes.subHeader,
        },
    }), [colours]);

    const handleIncrement = (index: number) => {
        const newValue = values[index] + 1;
        setters[index](newValue);
        if (onValuesChange) {
            const newValues = [...values];
            newValues[index] = newValue;
            onValuesChange(newValues[0], newValues[1], newValues[2], newValues[3], newValues[4], newValues[5], newValues[6]);
        }
    };

    const handleDecrement = (index: number) => {
        const newValue = Math.max(0, values[index] - 1);
        setters[index](newValue);
        if (onValuesChange) {
            const newValues = [...values];
            newValues[index] = newValue;
            onValuesChange(newValues[0], newValues[1], newValues[2], newValues[3], newValues[4], newValues[5], newValues[6]);
        }
    };

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
            <View style={localStyles.container}>
                <TouchableOpacity testID="7deadly-sins-start-round" onPress={handleStartRound} style={localStyles.saveButton}>
                    <Text style={localStyles.saveButtonText}>Start round</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={localStyles.container}>
            <TouchableOpacity
                testID="7deadly-sins-toggle"
                onPress={() => setIsOpen(prev => !prev)}
                style={localStyles.toggleHeader}
            >
                <Text style={localStyles.toggleLabel}>7 Deadly Sins</Text>
                <Text style={localStyles.chevron}>{isOpen ? '▾' : '▴'}</Text>
            </TouchableOpacity>

            {isOpen && counters.map((counter, index) => {
                if (counter.slug === 'bogeys-par5' && holePar !== 5) return null;
                if (counter.slug === 'double-bogeys' && (holePar === undefined || userScore === undefined || userScore < holePar + 2)) return null;
                return (
                    <View key={counter.slug} style={localStyles.row}>
                        <Text style={localStyles.label}>{counter.label}</Text>
                        <View style={localStyles.controls}>
                            <TouchableOpacity
                                testID={`7deadly-sins-decrement-${counter.slug}`}
                                onPress={() => handleDecrement(index)}
                                style={localStyles.button}
                            >
                                <Text style={localStyles.buttonText}>-</Text>
                            </TouchableOpacity>
                            <Text testID={`7deadly-sins-count-${counter.slug}`} style={localStyles.count}>
                                {values[index]}
                            </Text>
                            <TouchableOpacity
                                testID={`7deadly-sins-increment-${counter.slug}`}
                                onPress={() => handleIncrement(index)}
                                style={localStyles.button}
                            >
                                <Text style={localStyles.buttonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            })}

            {!roundControlled && (
                <TouchableOpacity testID="7deadly-sins-end-round" onPress={handleEndRound} style={localStyles.saveButton}>
                    <Text style={localStyles.saveButtonText}>End round</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default DeadlySinsTally;
