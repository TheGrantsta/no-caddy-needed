import React from 'react';
import { render } from '@testing-library/react-native';
import DrillRecommendation from '../../components/DrillRecommendation';
import { GiveCoachingResponse } from '../../service/AnalysisService';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

const FULL_RESPONSE: GiveCoachingResponse = {
    status: 'give_coaching',
    focus_issue: 'three_putts',
    reasoning_summary: 'Evidence points to poor lag distance control.',
    diagnosis: {
        primary_cause: 'poor_lag_distance_control',
        confidence: 0.8,
        supporting_facts: ['4 three-putts recorded', 'First putts consistently short'],
    },
    coaching: {
        summary: 'Work on lag putting to leave the ball within 3 feet consistently.',
        actions: [
            'Practice 30-foot lag putts',
            'Focus on pace over line',
            'Develop a pre-putt distance routine',
        ],
        drill_suggestions: ['Clock drill at 30 feet', 'Ladder drill'],
    },
    state_patch: { current_focus: null, issue_completed: true },
};

describe('DrillRecommendation component', () => {
    describe('coaching summary', () => {
        it('renders the coaching summary text', () => {
            const { getByTestId } = render(<DrillRecommendation response={FULL_RESPONSE} />);

            expect(getByTestId('drill-rec-summary').props.children).toBe(
                'Work on lag putting to leave the ball within 3 feet consistently.'
            );
        });
    });

    describe('actions', () => {
        it('renders each action', () => {
            const { getByTestId } = render(<DrillRecommendation response={FULL_RESPONSE} />);

            expect(getByTestId('drill-rec-action-0').props.children).toBe('Practice 30-foot lag putts');
            expect(getByTestId('drill-rec-action-1').props.children).toBe('Focus on pace over line');
            expect(getByTestId('drill-rec-action-2').props.children).toBe('Develop a pre-putt distance routine');
        });

        it('renders no actions when array is empty', () => {
            const response: GiveCoachingResponse = {
                ...FULL_RESPONSE,
                coaching: { ...FULL_RESPONSE.coaching, actions: [] },
            };
            const { queryByTestId } = render(<DrillRecommendation response={response} />);

            expect(queryByTestId('drill-rec-action-0')).toBeNull();
        });
    });

    describe('drill suggestions', () => {
        it('renders each drill suggestion', () => {
            const { getByTestId } = render(<DrillRecommendation response={FULL_RESPONSE} />);

            expect(getByTestId('drill-rec-drill-0').props.children).toBe('Clock drill at 30 feet');
            expect(getByTestId('drill-rec-drill-1').props.children).toBe('Ladder drill');
        });

        it('renders no drill suggestions when array is empty', () => {
            const response: GiveCoachingResponse = {
                ...FULL_RESPONSE,
                coaching: { ...FULL_RESPONSE.coaching, drill_suggestions: [] },
            };
            const { queryByTestId } = render(<DrillRecommendation response={response} />);

            expect(queryByTestId('drill-rec-drill-0')).toBeNull();
        });
    });

    describe('does not crash on minimal data', () => {
        it('renders with empty supporting_facts, actions, and drill_suggestions', () => {
            const response: GiveCoachingResponse = {
                ...FULL_RESPONSE,
                diagnosis: { primary_cause: 'unknown', confidence: 0.3, supporting_facts: [] },
                coaching: { summary: 'Keep practising.', actions: [], drill_suggestions: [] },
            };
            const { getByTestId } = render(<DrillRecommendation response={response} />);

            expect(getByTestId('drill-rec-summary').props.children).toBe('Keep practising.');
        });
    });
});
