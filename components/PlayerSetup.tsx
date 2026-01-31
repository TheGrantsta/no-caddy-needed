import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import colours from '../assets/colours';
import fontSizes from '../assets/font-sizes';

type Props = {
    onStartRound: (playerNames: string[]) => void;
};

const MAX_ADDITIONAL_PLAYERS = 3;

const PlayerSetup = ({ onStartRound }: Props) => {
    const [additionalPlayers, setAdditionalPlayers] = useState<string[]>([]);

    const handleAddPlayer = () => {
        if (additionalPlayers.length < MAX_ADDITIONAL_PLAYERS) {
            setAdditionalPlayers([...additionalPlayers, '']);
        }
    };

    const handleRemovePlayer = (index: number) => {
        setAdditionalPlayers(additionalPlayers.filter((_, i) => i !== index));
    };

    const handleNameChange = (index: number, name: string) => {
        const updated = [...additionalPlayers];
        updated[index] = name;
        setAdditionalPlayers(updated);
    };

    const handleStart = () => {
        const names = additionalPlayers.filter(name => name.trim().length > 0);
        onStartRound(names);
    };

    return (
        <View style={localStyles.container}>
            <View style={localStyles.playerRow}>
                <Text style={localStyles.playerName}>You</Text>
            </View>

            {additionalPlayers.map((name, index) => (
                <View key={index} style={localStyles.playerRow}>
                    <TextInput
                        testID={`player-name-input-${index}`}
                        style={localStyles.input}
                        placeholder="Player name"
                        placeholderTextColor={colours.backgroundAlternate}
                        value={name}
                        onChangeText={(text) => handleNameChange(index, text)}
                    />
                    <TouchableOpacity
                        testID={`remove-player-${index}`}
                        onPress={() => handleRemovePlayer(index)}
                        style={localStyles.removeButton}
                    >
                        <Text style={localStyles.removeButtonText}>X</Text>
                    </TouchableOpacity>
                </View>
            ))}

            {additionalPlayers.length < MAX_ADDITIONAL_PLAYERS && (
                <TouchableOpacity
                    testID="add-player-button"
                    onPress={handleAddPlayer}
                    style={localStyles.addButton}
                >
                    <Text style={localStyles.addButtonText}>+ Add player</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                testID="start-button"
                onPress={handleStart}
                style={localStyles.startButton}
            >
                <Text style={localStyles.startButtonText}>Start</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PlayerSetup;

const localStyles = StyleSheet.create({
    container: {
        padding: 15,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    playerName: {
        color: colours.yellow,
        fontSize: fontSizes.normal,
        fontWeight: 'bold',
    },
    input: {
        flex: 1,
        color: colours.text,
        fontSize: fontSizes.normal,
        borderBottomWidth: 1,
        borderBottomColor: colours.yellow,
        paddingVertical: 5,
    },
    removeButton: {
        marginLeft: 10,
        padding: 5,
    },
    removeButtonText: {
        color: colours.errorText,
        fontSize: fontSizes.normal,
        fontWeight: 'bold',
    },
    addButton: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    addButtonText: {
        color: colours.yellow,
        fontSize: fontSizes.normal,
    },
    startButton: {
        backgroundColor: colours.yellow,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    startButtonText: {
        color: colours.background,
        fontSize: fontSizes.tableHeader,
        fontWeight: 'bold',
    },
});
