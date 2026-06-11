import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    visible: boolean;
    text: string;
    onDismiss: () => void;
};

const PreShotReminder = ({ visible, text, onDismiss }: Props) => {
    const styles = useStyles();
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
                        <Text style={s.primaryButtonText}>Got it</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default PreShotReminder;
