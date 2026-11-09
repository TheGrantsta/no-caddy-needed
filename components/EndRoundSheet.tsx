import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    visible: boolean;
    holeNumber: number;
    holesTotal: number;
    onSave: () => void;
    onDiscard: () => void;
    onKeepPlaying: () => void;
};

// Action sheet shown from the End button: save or discard the round, or keep playing
const EndRoundSheet = ({ visible, holeNumber, holesTotal, onSave, onDiscard, onKeepPlaying }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.endRoundSheet;

    if (!visible) return null;

    return (
        <Modal transparent animationType="slide" visible onRequestClose={onKeepPlaying}>
            <TouchableOpacity activeOpacity={1} onPress={onKeepPlaying} style={s.backdrop} />
            <View testID="end-round-sheet" style={s.sheetContainer}>
                <View style={s.group}>
                    <View style={s.header}>
                        <Text style={s.title}>{`End round after hole ${holeNumber}?`}</Text>
                        <Text style={s.message}>
                            {`You’ve entered ${holeNumber} of ${holesTotal} holes. Saved rounds count towards Performance.`}
                        </Text>
                    </View>
                    <TouchableOpacity testID="end-round-save-button" onPress={onSave} style={s.action}>
                        <Text style={[s.actionText, { color: colours.primary }]}>Save round</Text>
                    </TouchableOpacity>
                    <View style={s.divider} />
                    <TouchableOpacity testID="end-round-discard-button" onPress={onDiscard} style={s.action}>
                        <Text style={[s.actionText, { color: colours.red }]}>Discard round</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity testID="end-round-keep-playing-button" onPress={onKeepPlaying} style={s.keepPlaying}>
                    <Text style={[s.actionText, { color: colours.primary, fontWeight: '700' }]}>Keep playing</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

export default EndRoundSheet;
