import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colours from '../assets/colours';
import fontSizes from '../assets/font-sizes';

type Props = {
    onEndRound: (threePutts: number, doubleBogeys: number, bogeysPar5: number, bogeysInside9Iron: number, doubleChips: number) => void;
    onRoundStateChange?: (active: boolean) => void;
    roundControlled?: boolean;
    onValuesChange?: (threePutts: number, doubleBogeys: number, bogeysPar5: number, bogeysInside9Iron: number, doubleChips: number) => void;
};

const counters = [
    { slug: 'three-putts', label: '3-putts' },
    { slug: 'double-bogeys', label: 'Double bogeys' },
    { slug: 'bogeys-par5', label: 'Bogeys on par 5s' },
    { slug: 'bogeys-inside-9iron', label: 'Bogeys inside 9-iron' },
    { slug: 'double-chips', label: 'Double chips' },
];

const Tiger5Tally = ({ onEndRound, onRoundStateChange, roundControlled, onValuesChange }: Props) => {
    const [roundActive, setRoundActive] = useState(roundControlled === true);
    const [threePutts, setThreePutts] = useState(0);
    const [doubleBogeys, setDoubleBogeys] = useState(0);
    const [bogeysPar5, setBogeysPar5] = useState(0);
    const [bogeysInside9Iron, setBogeysInside9Iron] = useState(0);
    const [doubleChips, setDoubleChips] = useState(0);

    const values = [threePutts, doubleBogeys, bogeysPar5, bogeysInside9Iron, doubleChips];
    const setters = [setThreePutts, setDoubleBogeys, setBogeysPar5, setBogeysInside9Iron, setDoubleChips];

    const total = threePutts + doubleBogeys + bogeysPar5 + bogeysInside9Iron + doubleChips;

    const handleIncrement = (index: number) => {
        const newValue = values[index] + 1;
        setters[index](newValue);
        if (onValuesChange) {
            const newValues = [...values];
            newValues[index] = newValue;
            onValuesChange(newValues[0], newValues[1], newValues[2], newValues[3], newValues[4]);
        }
    };

    const handleDecrement = (index: number) => {
        const newValue = Math.max(0, values[index] - 1);
        setters[index](newValue);
        if (onValuesChange) {
            const newValues = [...values];
            newValues[index] = newValue;
            onValuesChange(newValues[0], newValues[1], newValues[2], newValues[3], newValues[4]);
        }
    };

    const handleStartRound = () => {
        setRoundActive(true);
        onRoundStateChange?.(true);
    };

    const handleEndRound = () => {
        onEndRound(threePutts, doubleBogeys, bogeysPar5, bogeysInside9Iron, doubleChips);
        setThreePutts(0);
        setDoubleBogeys(0);
        setBogeysPar5(0);
        setBogeysInside9Iron(0);
        setDoubleChips(0);
        setRoundActive(false);
        onRoundStateChange?.(false);
    };

    if (!roundActive) {
        return (
            <View style={localStyles.container}>
                <TouchableOpacity testID="tiger5-start-round" onPress={handleStartRound} style={localStyles.saveButton}>
                    <Text style={localStyles.saveButtonText}>Start round</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={localStyles.container}>
            {counters.map((counter, index) => (
                <View key={counter.slug} style={localStyles.row}>
                    <Text style={localStyles.label}>{counter.label}</Text>
                    <View style={localStyles.controls}>
                        <TouchableOpacity
                            testID={`tiger5-decrement-${counter.slug}`}
                            onPress={() => handleDecrement(index)}
                            style={localStyles.button}
                        >
                            <Text style={localStyles.buttonText}>-</Text>
                        </TouchableOpacity>
                        <Text testID={`tiger5-count-${counter.slug}`} style={localStyles.count}>
                            {values[index]}
                        </Text>
                        <TouchableOpacity
                            testID={`tiger5-increment-${counter.slug}`}
                            onPress={() => handleIncrement(index)}
                            style={localStyles.button}
                        >
                            <Text style={localStyles.buttonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}

            <Text testID="tiger5-total" style={localStyles.total}>
                {'Total: '}{total}
            </Text>

            {!roundControlled && (
                <TouchableOpacity testID="tiger5-end-round" onPress={handleEndRound} style={localStyles.saveButton}>
                    <Text style={localStyles.saveButtonText}>End round</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default Tiger5Tally;

const localStyles = StyleSheet.create({
    container: {
        padding: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: colours.yellow,
    },
    label: {
        color: colours.text,
        fontSize: fontSizes.normal,
        flex: 1,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        backgroundColor: colours.yellow,
        width: 36,
        height: 36,
        borderRadius: 18,
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
    total: {
        color: colours.yellow,
        fontSize: fontSizes.subHeader,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 10,
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
});
