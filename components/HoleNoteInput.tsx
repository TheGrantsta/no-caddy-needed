import { TextInput } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    note: string;
    onNoteChange: (text: string) => void;
};

// Always-visible notes field in a white rounded card, as on the hole screen mockup
const HoleNoteInput = ({ note, onNoteChange }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();

    return (
        <TextInput
            testID="hole-note-input"
            style={styles.holeScreen.noteInput}
            value={note}
            onChangeText={onNoteChange}
            placeholder="e.g. Driver off the tee"
            placeholderTextColor={colours.tertiary}
            multiline
            textAlignVertical="top"
        />
    );
};

export default HoleNoteInput;
