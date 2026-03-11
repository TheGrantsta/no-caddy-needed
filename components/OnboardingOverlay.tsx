import { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type OnboardingStep = {
    text: string;
};

type Props = {
    visible: boolean;
    onDismiss: () => void;
    title: string;
    steps: OnboardingStep[];
};

const OnboardingOverlay = ({ visible, onDismiss, title, steps }: Props) => {
    const styles = useStyles();
    const s = styles.onboardingOverlay;
    const [currentStep, setCurrentStep] = useState(0);

    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;
    const isSingleStep = steps.length === 1;

    const handleNext = () => {
        if (isLastStep) {
            onDismiss();
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (!isFirstStep) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (!visible) {
        return null;
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            testID="onboarding-overlay"
        >
            <View style={s.overlay}>
                <View style={s.container}>
                    <Text style={s.title}>{title}</Text>
                    <Text style={s.stepText}>{steps[currentStep].text}</Text>

                    {steps.length > 1 && (
                        <View style={s.indicatorContainer}>
                            {steps.map((_, index) => (
                                <View
                                    key={index}
                                    testID={`step-indicator-${index}`}
                                    style={[
                                        s.indicator,
                                        index === currentStep
                                            ? styles.scrollActiveDot
                                            : styles.scrollIndicatorDot
                                    ]}
                                />
                            ))}
                        </View>
                    )}

                    <View style={s.buttonContainer}>
                        {!isFirstStep ? (
                            <TouchableOpacity
                                testID="back-button"
                                onPress={handleBack}
                                style={s.secondaryButton}
                            >
                                <Text style={s.secondaryButtonText}>Back</Text>
                            </TouchableOpacity>
                        ) : !isSingleStep ? (
                            <TouchableOpacity
                                testID="skip-button"
                                onPress={onDismiss}
                                style={s.secondaryButton}
                            >
                                <Text style={s.secondaryButtonText}>Skip</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={s.spacer} />
                        )}

                        {isLastStep || isSingleStep ? (
                            <TouchableOpacity
                                testID="done-button"
                                onPress={onDismiss}
                                style={s.primaryButton}
                            >
                                <Text style={s.primaryButtonText}>Done</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                testID="next-button"
                                onPress={handleNext}
                                style={s.primaryButton}
                            >
                                <Text style={s.primaryButtonText}>Next</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default OnboardingOverlay;
