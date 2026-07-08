import { useEffect, useRef, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useAppToast } from '@/hooks/useAppToast';
import { insertDrillService } from '@/service/DbService';

const FIXED_ICON = 'handyman';

const STEPS = [
    { question: 'What do you want to call this test?', placeholder: 'e.g. Gate test', multiline: false },
    { question: "What is the aim?", placeholder: 'e.g. 8/10', multiline: false },
    { question: 'What is the objective?', placeholder: 'Objective', multiline: true },
    { question: 'How do you set it up?', placeholder: 'Set up', multiline: true },
    { question: 'How do you play it?', placeholder: 'How to play', multiline: true },
];

type Props = {
    category: string;
    onSaved: () => void;
    onCancel: () => void;
};

export default function AddDrillForm({ category, onSaved, onCancel }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const { showSuccess } = useAppToast();

    const [step, setStep] = useState(0);
    const [stepError, setStepError] = useState('');
    const [label, setLabel] = useState('');
    const [target, setTarget] = useState('');
    const [objective, setObjective] = useState('');
    const [setUp, setSetUp] = useState('');
    const [howToPlay, setHowToPlay] = useState('');
    const [saveError, setSaveError] = useState('');

    const fieldValues = [label, target, objective, setUp, howToPlay];
    const fieldSetters = [setLabel, setTarget, setObjective, setSetUp, setHowToPlay];

    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        const timer = setTimeout(() => inputRef.current?.focus(), 50);
        return () => clearTimeout(timer);
    }, [step]);

    const isLastStep = step === STEPS.length - 1;
    const currentStep = STEPS[step];
    const currentValue = fieldValues[step];
    const isCurrentFieldValid = currentValue.trim() !== '';

    const handleNext = async () => {
        if (!isCurrentFieldValid) {
            return;
        }
        setStepError('');

        if (isLastStep) {
            const success = await insertDrillService(
                category,
                label.trim(),
                FIXED_ICON,
                target.trim(),
                objective.trim(),
                setUp.trim(),
                howToPlay.trim()
            );
            if (success) {
                showSuccess('Drill saved');
                onSaved();
            } else {
                setSaveError('Failed to save drill');
            }
            return;
        }

        setStep(s => s + 1);
    };

    const handleBack = () => {
        setStep(s => s - 1);
        setStepError('');
    };

    return (
        <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                {STEPS.map((_, i) => (
                    <View
                        key={i}
                        testID='drill-wizard-dot'
                        style={[
                            { width: 10, height: 10, borderRadius: 5, marginHorizontal: 5 },
                            { backgroundColor: i === step ? colours.primary : colours.tertiary },
                        ]}
                    />
                ))}
            </View>

            <Text style={[styles.normalText, { marginBottom: 16, fontWeight: '600' }]}>
                {currentStep.question}
            </Text>

            <TextInput
                testID='drill-wizard-input'
                ref={inputRef}
                style={[
                    styles.textInput,
                    currentStep.multiline ? { minHeight: 100, textAlignVertical: 'top' } : undefined,
                    stepError ? styles.textInputError : undefined,
                ]}
                value={currentValue}
                onChangeText={(text) => {
                    fieldSetters[step]?.(text);
                    setStepError('');
                }}
                placeholder={currentStep.placeholder}
                placeholderTextColor={colours.backgroundAlternate}
                multiline={currentStep.multiline}
                maxLength={currentStep.multiline ? 100 : undefined}
                autoFocus
            />

            {stepError ? <Text style={styles.errorText}>{stepError}</Text> : null}
            {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                {step === 0 ? (
                    <TouchableOpacity testID='drill-wizard-cancel' style={[styles.button, { backgroundColor: colours.red }]} onPress={onCancel}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity testID='drill-wizard-back' style={styles.button} onPress={handleBack}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    testID='drill-wizard-next'
                    style={[styles.button, !isCurrentFieldValid && { opacity: 0.5 }]}
                    onPress={handleNext}
                    disabled={!isCurrentFieldValid}
                >
                    <Text style={styles.buttonText}>{isLastStep ? 'Save' : 'Next'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
