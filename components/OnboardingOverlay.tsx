import { useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColours } from '../context/ThemeContext';
import fontSizes from '../assets/font-sizes';

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
    const colours = useThemeColours();
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

    const localStyles = useMemo(() => StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        container: {
            backgroundColor: colours.background,
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            borderWidth: 2,
            borderColor: colours.yellow,
        },
        title: {
            color: colours.yellow,
            fontSize: fontSizes.header,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
        },
        stepText: {
            color: colours.text,
            fontSize: fontSizes.normal,
            textAlign: 'center',
            marginBottom: 24,
            lineHeight: 24,
        },
        indicatorContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 20,
        },
        indicator: {
            width: 10,
            height: 10,
            borderRadius: 5,
            marginHorizontal: 4,
        },
        indicatorActive: {
            backgroundColor: colours.yellow,
        },
        indicatorInactive: {
            backgroundColor: colours.backgroundAlternate,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        primaryButton: {
            backgroundColor: colours.yellow,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
        },
        primaryButtonText: {
            color: colours.background,
            fontSize: fontSizes.normal,
            fontWeight: 'bold',
        },
        secondaryButton: {
            paddingVertical: 12,
            paddingHorizontal: 24,
        },
        secondaryButtonText: {
            color: colours.backgroundAlternate,
            fontSize: fontSizes.normal,
        },
        spacer: {
            width: 80,
        },
    }), [colours]);

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
            <View style={localStyles.overlay}>
                <View style={localStyles.container}>
                    <Text style={localStyles.title}>{title}</Text>
                    <Text style={localStyles.stepText}>{steps[currentStep].text}</Text>

                    {steps.length > 1 && (
                        <View style={localStyles.indicatorContainer}>
                            {steps.map((_, index) => (
                                <View
                                    key={index}
                                    testID={`step-indicator-${index}`}
                                    style={[
                                        localStyles.indicator,
                                        index === currentStep
                                            ? localStyles.indicatorActive
                                            : localStyles.indicatorInactive,
                                    ]}
                                />
                            ))}
                        </View>
                    )}

                    <View style={localStyles.buttonContainer}>
                        {!isFirstStep ? (
                            <TouchableOpacity
                                testID="back-button"
                                onPress={handleBack}
                                style={localStyles.secondaryButton}
                            >
                                <Text style={localStyles.secondaryButtonText}>Back</Text>
                            </TouchableOpacity>
                        ) : !isSingleStep ? (
                            <TouchableOpacity
                                testID="skip-button"
                                onPress={onDismiss}
                                style={localStyles.secondaryButton}
                            >
                                <Text style={localStyles.secondaryButtonText}>Skip</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={localStyles.spacer} />
                        )}

                        {isLastStep || isSingleStep ? (
                            <TouchableOpacity
                                testID="done-button"
                                onPress={onDismiss}
                                style={localStyles.primaryButton}
                            >
                                <Text style={localStyles.primaryButtonText}>Done</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                testID="next-button"
                                onPress={handleNext}
                                style={localStyles.primaryButton}
                            >
                                <Text style={localStyles.primaryButtonText}>Next</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default OnboardingOverlay;
