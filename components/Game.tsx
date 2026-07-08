import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Instructions from './Instructions';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';

type Props = {
    header: string;
    objective: string;
    setUp: string;
    howToPlay: string;
    onDelete?: () => void;
};

export default function Game({ header, objective, setUp, howToPlay, onDelete }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const [pendingDelete, setPendingDelete] = useState(false);

    return (
        <View style={{ padding: 8 }}>
            <Text style={styles.subHeaderText}>{header}</Text>
            <View>
                <Instructions objective={objective} setUp={setUp} howToPlay={howToPlay} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 8 }}>
                {pendingDelete ? (
                    <>
                        <TouchableOpacity
                            testID='cancel-game-delete'
                            style={[styles.mediumButton, { backgroundColor: colours.red }]}
                            onPress={() => setPendingDelete(false)}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            testID='confirm-game-delete'
                            style={styles.mediumButton}
                            onPress={() => { onDelete?.(); setPendingDelete(false); }}>
                            <Text style={styles.buttonText}>Confirm</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        testID='delete-game-button'
                        style={{ padding: 8 }}
                        onPress={() => setPendingDelete(true)}>
                        <Text style={{ color: colours.red, fontSize: fontSizes.normal }}>Delete</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
