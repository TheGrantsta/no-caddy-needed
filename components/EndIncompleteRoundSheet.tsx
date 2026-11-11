import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

// Confirms before an unfinished round is ended, in the same overlay style as the delete sheet
const EndIncompleteRoundSheet = ({ visible, onConfirm, onCancel }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.endRoundSheet;

    if (!visible) return null;

    return (
        <Modal transparent animationType="slide" visible onRequestClose={onCancel}>
            <TouchableOpacity activeOpacity={1} onPress={onCancel} style={s.backdrop} />
            <View testID="end-incomplete-round-sheet" style={s.sheetContainer}>
                <View style={s.group}>
                    <View style={s.header}>
                        <Text style={s.title}>End round?</Text>
                    </View>
                    <View style={s.divider} />
                    <TouchableOpacity testID="confirm-end-round-button" onPress={onConfirm} style={s.action}>
                        <Text style={[s.actionText, { color: colours.primary }]}>Confirm</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity testID="end-round-cancel-button" onPress={onCancel} style={s.keepPlaying}>
                    <Text style={[s.actionText, { color: colours.primary, fontWeight: '700' }]}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

export default EndIncompleteRoundSheet;
