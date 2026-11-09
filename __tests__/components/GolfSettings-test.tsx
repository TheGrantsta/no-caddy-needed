import React from 'react';
import { Animated } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import GolfSettings from '../../components/GolfSettings';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({ theme: 'dark', colours: require('../../assets/colours').default }),
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

const settings = {
    preShotReminderEnabled: false,
    skipStatsFlowEnabled: false,
    badHoleReassuranceEnabled: true,
} as any;

const renderGolf = (overrides: object = {}, showRoutineInput = false) => {
    const handlers = {
        onRoutineTextChange: jest.fn(),
        onRoutineTextSave: jest.fn(),
        onPreShotEnabledChange: jest.fn(),
        onScoreOnlyModeChange: jest.fn(),
        onBadHoleReassuranceChange: jest.fn(),
    };
    const utils = render(
        <GolfSettings
            settings={{ ...settings, ...overrides }}
            routineText="Breathe"
            showRoutineInput={showRoutineInput}
            routineFadeAnim={new Animated.Value(1)}
            {...handlers}
        />
    );
    return { ...utils, ...handlers };
};

describe('GolfSettings', () => {
    it('shouldShowTheGolfSectionWithItsThreeSwitches', () => {
        const { getByText, getByTestId } = renderGolf();

        expect(getByText('GOLF')).toBeTruthy();
        expect(getByText('Show pre-shot routine')).toBeTruthy();
        expect(getByText('Score-only mode')).toBeTruthy();
        expect(getByText('Bad hole reminder')).toBeTruthy();
        expect(getByTestId('preshot-switch')).toBeTruthy();
        expect(getByTestId('score-only-switch')).toBeTruthy();
        expect(getByTestId('bad-hole-reassurance-switch')).toBeTruthy();
    });

    it('shouldReflectEachSettingInItsSwitch', () => {
        const { getByTestId } = renderGolf({ preShotReminderEnabled: true, skipStatsFlowEnabled: false, badHoleReassuranceEnabled: true });

        expect(getByTestId('preshot-switch').props.value).toBe(true);
        expect(getByTestId('score-only-switch').props.value).toBe(false);
        expect(getByTestId('bad-hole-reassurance-switch').props.value).toBe(true);
    });

    it('shouldReportPreShotChangeFromItsSwitch', () => {
        const { getByTestId, onPreShotEnabledChange } = renderGolf();

        fireEvent(getByTestId('preshot-switch'), 'valueChange', true);

        expect(onPreShotEnabledChange).toHaveBeenCalledWith(true);
    });

    it('shouldReportScoreOnlyChangeFromItsSwitch', () => {
        const { getByTestId, onScoreOnlyModeChange } = renderGolf();

        fireEvent(getByTestId('score-only-switch'), 'valueChange', true);

        expect(onScoreOnlyModeChange).toHaveBeenCalledWith(true);
    });

    it('shouldReportBadHoleChangeFromItsSwitch', () => {
        const { getByTestId, onBadHoleReassuranceChange } = renderGolf();

        fireEvent(getByTestId('bad-hole-reassurance-switch'), 'valueChange', false);

        expect(onBadHoleReassuranceChange).toHaveBeenCalledWith(false);
    });

    it('shouldShowTheRoutineInputOnlyWhenPreShotIsOn', () => {
        const { queryByTestId, rerender } = renderGolf({}, false);
        expect(queryByTestId('preshot-routine-input')).toBeNull();

        rerender(
            <GolfSettings
                settings={settings}
                routineText="Breathe"
                onRoutineTextChange={jest.fn()}
                onRoutineTextSave={jest.fn()}
                showRoutineInput={true}
                routineFadeAnim={new Animated.Value(1)}
                onPreShotEnabledChange={jest.fn()}
                onScoreOnlyModeChange={jest.fn()}
                onBadHoleReassuranceChange={jest.fn()}
            />
        );
        expect(queryByTestId('preshot-routine-input')).toBeTruthy();
    });
});
