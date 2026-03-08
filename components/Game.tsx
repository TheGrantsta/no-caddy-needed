import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Instructions from './Instructions';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    header: string;
    objective: string;
    setUp: string;
    howToPlay: string;
    onDelete?: () => void;
};

export default function Game({ header, objective, setUp, howToPlay, onDelete }: Props) {
    const styles = useStyles();
    const [pendingDelete, setPendingDelete] = useState(false);

    return (
        <View style={{ padding: 8 }}>
            <Text style={styles.subHeaderText}>{header}</Text>
            <View>
                <Instructions objective={objective} setUp={setUp} howToPlay={howToPlay} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 8 }}>
                {pendingDelete ? (
                    <>
                        <TouchableOpacity
                            testID='cancel-game-delete'
                            style={styles.button}
                            onPress={() => setPendingDelete(false)}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            testID='confirm-game-delete'
                            style={styles.button}
                            onPress={() => { onDelete?.(); setPendingDelete(false); }}>
                            <Text style={styles.buttonText}>Confirm</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        testID='delete-game-button'
                        style={styles.button}
                        onPress={() => setPendingDelete(true)}>
                        <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
