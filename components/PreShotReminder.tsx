import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    visible: boolean;
    text: string;
    onDismiss: () => void;
};

const PreShotReminder = ({ visible, text, onDismiss }: Props) => {
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
            testID="preshot-reminder"
        >
            <View style={s.overlay}>
                <View style={s.container}>
                    <Text style={s.title}>Pre-shot routine</Text>
                    <Text style={s.stepText}>{text}</Text>
                    <TouchableOpacity
                        testID="preshot-reminder-dismiss"
                        onPress={onDismiss}
                        style={s.primaryButton}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Text style={s.primaryButtonText}>Got it</Text>
                            <View testID="preshot-thumbs-up">
                                <MaterialIcons name="thumb-up" size={20} color={colours.background} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default PreShotReminder;
