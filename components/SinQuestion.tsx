import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';
import { AiQuestion, QuestionOption } from '@/service/AnalysisService';

export type SingleChoiceAnswer = { option_id: string; label: string };
export type MultiChoiceAnswer = { option_id: string; label: string }[];
export type ScaleAnswer = { value: number };
export type ShortTextAnswer = { value: string };
export type AnswerValue = SingleChoiceAnswer | MultiChoiceAnswer | ScaleAnswer | ShortTextAnswer;

type Props = {
    question: AiQuestion;
    onAnswer: (answer: AnswerValue) => void;
};

const SinQuestion = ({ question, onAnswer }: Props) => {
    const colours = useThemeColours();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [scaleValue, setScaleValue] = useState(question.scale?.min ?? 1);
    const [textValue, setTextValue] = useState('');

    const handleSingleChoice = (option: QuestionOption) => {
        onAnswer({ option_id: option.id, label: option.label });
    };

    const handleMultiToggle = (option: QuestionOption) => {
        setSelectedIds(prev =>
            prev.includes(option.id) ? prev.filter(id => id !== option.id) : [...prev, option.id]
        );
    };

    const handleMultiSubmit = () => {
        const selected = (question.options ?? [])
            .filter(o => selectedIds.includes(o.id))
            .map(o => ({ option_id: o.id, label: o.label }));
        onAnswer(selected);
    };

    const handleScaleIncrement = () => {
        setScaleValue(prev => Math.min(prev + 1, question.scale?.max ?? prev));
    };

    const handleScaleDecrement = () => {
        setScaleValue(prev => Math.max(prev - 1, question.scale?.min ?? prev));
    };

    const handleScaleSubmit = () => {
        onAnswer({ value: scaleValue });
    };

    const handleTextSubmit = () => {
        onAnswer({ value: textValue });
    };

    const s = StyleSheet.create({
        container: { padding: 16 },
        questionText: { color: colours.text, fontSize: 16, fontWeight: '600', marginBottom: 16 },
        option: {
            backgroundColor: colours.cardBackground,
            borderRadius: 8,
            padding: 12,
            marginBottom: 8,
        },
        optionSelected: { borderWidth: 2, borderColor: colours.primary },
        optionText: { color: colours.text, fontSize: 15 },
        scaleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 12 },
        scaleButton: {
            backgroundColor: colours.cardBackground,
            borderRadius: 8,
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
        },
        scaleButtonText: { color: colours.text, fontSize: 22, fontWeight: '700' },
        scaleValue: { color: colours.text, fontSize: 28, fontWeight: '700', minWidth: 32, textAlign: 'center' },
        scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
        scaleLabel: { color: colours.textSecondary, fontSize: 12 },
        textInput: {
            backgroundColor: colours.cardBackground,
            color: colours.text,
            borderRadius: 8,
            padding: 12,
            fontSize: 15,
            marginBottom: 12,
            minHeight: 80,
            textAlignVertical: 'top',
        },
        submitButton: {
            backgroundColor: colours.primary,
            borderRadius: 8,
            padding: 14,
            alignItems: 'center',
            marginTop: 4,
        },
        submitText: { color: colours.white, fontSize: 15, fontWeight: '600' },
    });

    return (
        <View style={s.container}>
            <Text testID="sin-question-text" style={s.questionText}>
                {question.text}
            </Text>

            {question.type === 'single_choice' && (
                <>
                    {(question.options ?? []).map(option => (
                        <TouchableOpacity
                            key={option.id}
                            testID={`sin-question-option-${option.id}`}
                            style={s.option}
                            onPress={() => handleSingleChoice(option)}
                        >
                            <Text style={s.optionText}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </>
            )}

            {question.type === 'multi_choice' && (
                <>
                    {(question.options ?? []).map(option => (
                        <TouchableOpacity
                            key={option.id}
                            testID={`sin-question-option-${option.id}`}
                            style={[s.option, selectedIds.includes(option.id) && s.optionSelected]}
                            onPress={() => handleMultiToggle(option)}
                        >
                            <Text style={s.optionText}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity testID="sin-question-submit" style={s.submitButton} onPress={handleMultiSubmit}>
                        <Text style={s.submitText}>Submit</Text>
                    </TouchableOpacity>
                </>
            )}

            {question.type === 'scale' && question.scale && (
                <>
                    <View style={s.scaleRow}>
                        <TouchableOpacity
                            testID="sin-question-scale-decrement"
                            style={s.scaleButton}
                            onPress={handleScaleDecrement}
                        >
                            <Text style={s.scaleButtonText}>−</Text>
                        </TouchableOpacity>
                        <Text testID="sin-question-scale-value" style={s.scaleValue}>
                            {scaleValue}
                        </Text>
                        <TouchableOpacity
                            testID="sin-question-scale-increment"
                            style={s.scaleButton}
                            onPress={handleScaleIncrement}
                        >
                            <Text style={s.scaleButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={s.scaleLabels}>
                        <Text style={s.scaleLabel}>{question.scale.min_label}</Text>
                        <Text style={s.scaleLabel}>{question.scale.max_label}</Text>
                    </View>
                    <TouchableOpacity testID="sin-question-submit" style={s.submitButton} onPress={handleScaleSubmit}>
                        <Text style={s.submitText}>Submit</Text>
                    </TouchableOpacity>
                </>
            )}

            {question.type === 'short_text' && (
                <>
                    <TextInput
                        testID="sin-question-text-input"
                        style={s.textInput}
                        value={textValue}
                        onChangeText={setTextValue}
                        multiline
                        placeholder="Type your answer..."
                        placeholderTextColor={colours.textSecondary}
                    />
                    <TouchableOpacity testID="sin-question-submit" style={s.submitButton} onPress={handleTextSubmit}>
                        <Text style={s.submitText}>Submit</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

export default SinQuestion;
