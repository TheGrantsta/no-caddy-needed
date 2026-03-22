import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import SinQuestion from '../../components/SinQuestion';
import { AiQuestion } from '../../service/AnalysisService';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

const SINGLE_CHOICE_QUESTION: AiQuestion = {
    id: 'pace_short_cause',
    text: 'When your first putt finished short, was it pace or a misread?',
    type: 'single_choice',
    options: [
        { id: 'pace', label: 'Pace — hit it too softly' },
        { id: 'misread', label: 'Misread — thought it was shorter' },
        { id: 'not_sure', label: 'Not sure' },
    ],
};

const MULTI_CHOICE_QUESTION: AiQuestion = {
    id: 'tee_trouble_types',
    text: 'Which tee shot problems did you experience?',
    type: 'multi_choice',
    options: [
        { id: 'slice', label: 'Slice / fade' },
        { id: 'hook', label: 'Hook / draw' },
        { id: 'topped', label: 'Topped or thin' },
        { id: 'ob', label: 'Out of bounds' },
    ],
};

const SCALE_QUESTION: AiQuestion = {
    id: 'confidence_level',
    text: 'How confident were you over putts today?',
    type: 'scale',
    scale: { min: 1, max: 5, min_label: 'Not at all', max_label: 'Very confident' },
};

const SHORT_TEXT_QUESTION: AiQuestion = {
    id: 'other_notes',
    text: 'Anything else about your putting today?',
    type: 'short_text',
};

describe('SinQuestion component', () => {
    const mockOnAnswer = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('question text', () => {
        it('renders the question text', () => {
            const { getByTestId } = render(
                <SinQuestion question={SINGLE_CHOICE_QUESTION} onAnswer={mockOnAnswer} />
            );

            expect(getByTestId('sin-question-text').props.children).toBe(
                'When your first putt finished short, was it pace or a misread?'
            );
        });
    });

    describe('single_choice', () => {
        it('renders all options', () => {
            const { getByTestId } = render(
                <SinQuestion question={SINGLE_CHOICE_QUESTION} onAnswer={mockOnAnswer} />
            );

            expect(getByTestId('sin-question-option-pace')).toBeTruthy();
            expect(getByTestId('sin-question-option-misread')).toBeTruthy();
            expect(getByTestId('sin-question-option-not_sure')).toBeTruthy();
        });

        it('renders option labels', () => {
            const { getByText } = render(
                <SinQuestion question={SINGLE_CHOICE_QUESTION} onAnswer={mockOnAnswer} />
            );

            expect(getByText('Pace — hit it too softly')).toBeTruthy();
            expect(getByText('Misread — thought it was shorter')).toBeTruthy();
        });

        it('calls onAnswer immediately when an option is pressed', () => {
            const { getByTestId } = render(
                <SinQuestion question={SINGLE_CHOICE_QUESTION} onAnswer={mockOnAnswer} />
            );

            fireEvent.press(getByTestId('sin-question-option-pace'));

            expect(mockOnAnswer).toHaveBeenCalledTimes(1);
        });

        it('calls onAnswer with option_id and label for the selected option', () => {
            const { getByTestId } = render(
                <SinQuestion question={SINGLE_CHOICE_QUESTION} onAnswer={mockOnAnswer} />
            );

            fireEvent.press(getByTestId('sin-question-option-misread'));

            expect(mockOnAnswer).toHaveBeenCalledWith({
                option_id: 'misread',
                label: 'Misread — thought it was shorter',
            });
        });

        it('does not show a submit button', () => {
            const { queryByTestId } = render(
                <SinQuestion question={SINGLE_CHOICE_QUESTION} onAnswer={mockOnAnswer} />
            );

            expect(queryByTestId('sin-question-submit')).toBeNull();
        });
    });

    describe('multi_choice', () => {
        it('renders all options', () => {
            const { getByTestId } = render(
                <SinQuestion question={MULTI_CHOICE_QUESTION} onAnswer={mockOnAnswer} />
            );

            expect(getByTestId('sin-question-option-slice')).toBeTruthy();
            expect(getByTestId('sin-question-option-hook')).toBeTruthy();
            expect(getByTestId('sin-question-option-topped')).toBeTruthy();
            expect(getByTestId('sin-question-option-ob')).toBeTruthy();
        });

        it('shows a submit button', () => {
            const { getByTestId } = render(
                <SinQuestion question={MULTI_CHOICE_QUESTION} onAnswer={mockOnAnswer} />
            );

            expect(getByTestId('sin-question-submit')).toBeTruthy();
        });

        it('does not call onAnswer when an option is pressed without submitting', () => {
            const { getByTestId } = render(
                <SinQuestion question={MULTI_CHOICE_QUESTION} onAnswer={mockOnAnswer} />
            );

            fireEvent.press(getByTestId('sin-question-option-slice'));

            expect(mockOnAnswer).not.toHaveBeenCalled();
        });

        it('calls onAnswer with selected options array on submit', () => {
            const { getByTestId } = render(
                <SinQuestion question={MULTI_CHOICE_QUESTION} onAnswer={mockOnAnswer} />
            );

            fireEvent.press(getByTestId('sin-question-option-slice'));
            fireEvent.press(getByTestId('sin-question-option-ob'));
            fireEvent.press(getByTestId('sin-question-submit'));

            expect(mockOnAnswer).toHaveBeenCalledWith([
                { option_id: 'slice', label: 'Slice / fade' },
                { option_id: 'ob', label: 'Out of bounds' },
            ]);
        });

        it('deselects an option when pressed again', () => {
            const { getByTestId } = render(
                <SinQuestion question={MULTI_CHOICE_QUESTION} onAnswer={mockOnAnswer} />
            );

            fireEvent.press(getByTestId('sin-question-option-slice'));
            fireEvent.press(getByTestId('sin-question-option-slice'));
            fireEvent.press(getByTestId('sin-question-submit'));

            expect(mockOnAnswer).toHaveBeenCalledWith([]);
        });

        it('calls onAnswer with empty array when nothing selected on submit', () => {
            const { getByTestId } = render(
                <SinQuestion question={MULTI_CHOICE_QUESTION} onAnswer={mockOnAnswer} />
            );

            fireEvent.press(getByTestId('sin-question-submit'));

            expect(mockOnAnswer).toHaveBeenCalledWith([]);
        });
    });

    describe('scale', () => {
        it('renders the scale value display', () => {
            const { getByTestId } = render(
                <SinQuestion question={SCALE_QUESTION} onAnswer={mockOnAnswer} />
            );

            expect(getByTestId('sin-question-scale-value')).toBeTruthy();
        });

        it('starts at the min value', () => {
            const { getByTestId } = render(
                <SinQuestion question={SCALE_QUESTION} onAnswer={mockOnAnswer} />
            );

            expect(getByTestId('sin-question-scale-value').props.children).toBe(1);
        });

        it('renders min and max labels', () => {
            const { getByText } = render(
                <SinQuestion question={SCALE_QUESTION} onAnswer={mockOnAnswer} />
            );

            expect(getByText('Not at all')).toBeTruthy();
            expect(getByText('Very confident')).toBeTruthy();
        });

        it('increments the value when increment pressed', () => {
            const { getByTestId } = render(
                <SinQuestion question={SCALE_QUESTION} onAnswer={mockOnAnswer} />
            );

            fireEvent.press(getByTestId('sin-question-scale-increment'));

            expect(getByTestId('sin-question-scale-value').props.children).toBe(2);
        });

        it('decrements the value when decrement pressed', () => {
            const { getByTestId } = render(
                <SinQuestion question={SCALE_QUESTION} onAnswer={mockOnAnswer} />
            );

            fireEvent.press(getByTestId('sin-question-scale-increment'));
            fireEvent.press(getByTestId('sin-question-scale-increment'));
            fireEvent.press(getByTestId('sin-question-scale-decrement'));

            expect(getByTestId('sin-question-scale-value').props.children).toBe(2);
        });

        it('does not go below min', () => {
            const { getByTestId } = render(
                <SinQuestion question={SCALE_QUESTION} onAnswer={mockOnAnswer} />
            );

            fireEvent.press(getByTestId('sin-question-scale-decrement'));

            expect(getByTestId('sin-question-scale-value').props.children).toBe(1);
        });

        it('does not go above max', () => {
            const { getByTestId } = render(
                <SinQuestion question={SCALE_QUESTION} onAnswer={mockOnAnswer} />
            );

            for (let i = 0; i < 10; i++) {
                fireEvent.press(getByTestId('sin-question-scale-increment'));
            }

            expect(getByTestId('sin-question-scale-value').props.children).toBe(5);
        });

        it('shows a submit button', () => {
            const { getByTestId } = render(
                <SinQuestion question={SCALE_QUESTION} onAnswer={mockOnAnswer} />
            );

            expect(getByTestId('sin-question-submit')).toBeTruthy();
        });

        it('calls onAnswer with value on submit', () => {
            const { getByTestId } = render(
                <SinQuestion question={SCALE_QUESTION} onAnswer={mockOnAnswer} />
            );

            fireEvent.press(getByTestId('sin-question-scale-increment'));
            fireEvent.press(getByTestId('sin-question-scale-increment'));
            fireEvent.press(getByTestId('sin-question-submit'));

            expect(mockOnAnswer).toHaveBeenCalledWith({ value: 3 });
        });
    });

    describe('short_text', () => {
        it('renders a text input', () => {
            const { getByTestId } = render(
                <SinQuestion question={SHORT_TEXT_QUESTION} onAnswer={mockOnAnswer} />
            );

            expect(getByTestId('sin-question-text-input')).toBeTruthy();
        });

        it('shows a submit button', () => {
            const { getByTestId } = render(
                <SinQuestion question={SHORT_TEXT_QUESTION} onAnswer={mockOnAnswer} />
            );

            expect(getByTestId('sin-question-submit')).toBeTruthy();
        });

        it('calls onAnswer with entered text on submit', () => {
            const { getByTestId } = render(
                <SinQuestion question={SHORT_TEXT_QUESTION} onAnswer={mockOnAnswer} />
            );

            fireEvent.changeText(getByTestId('sin-question-text-input'), 'I was rushing my putts');
            fireEvent.press(getByTestId('sin-question-submit'));

            expect(mockOnAnswer).toHaveBeenCalledWith({ value: 'I was rushing my putts' });
        });

        it('calls onAnswer with empty string when nothing entered', () => {
            const { getByTestId } = render(
                <SinQuestion question={SHORT_TEXT_QUESTION} onAnswer={mockOnAnswer} />
            );

            fireEvent.press(getByTestId('sin-question-submit'));

            expect(mockOnAnswer).toHaveBeenCalledWith({ value: '' });
        });
    });
});
