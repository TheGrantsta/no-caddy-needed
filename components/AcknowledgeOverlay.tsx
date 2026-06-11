import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    visible: boolean;
    title: string;
    text: string;
    onDismiss: () => void;
    textAlign?: 'left' | 'center';
};

/**
 * A simple modal notice the user acknowledges with a "Got it" 👍 button.
 * Shared by the pre-shot routine reminder and the "What's new" overlay.
 */
const AcknowledgeOverlay = ({ visible, title, text, onDismiss, textAlign = 'center' }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.onboardingOverlay;

    if (!visible) return null;

    return (
        <Modal
            visible
            transparent
            animationType="fade"
            onRequestClose={onDismiss}
            testID="acknowledge-overlay"
        >
            <View style={s.overlay}>
                <View style={s.container}>
                    <Text style={s.title}>{title}</Text>
                    <Text style={[s.stepText, { textAlign }]}>{text}</Text>
                    <TouchableOpacity
                        testID="acknowledge-dismiss"
                        onPress={onDismiss}
                        style={s.primaryButton}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Text style={s.primaryButtonText}>Got it</Text>
                            <View testID="acknowledge-thumbs-up">
                                <MaterialIcons name="thumb-up" size={20} color={colours.background} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default AcknowledgeOverlay;
