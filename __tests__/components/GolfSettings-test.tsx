import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import GolfSettings from '../../components/GolfSettings';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({ theme: 'dark', colours: require('../../assets/colours').default }),
}));

const settings = {
    skipStatsFlowEnabled: false,
    badHoleReassuranceEnabled: true,
} as any;

const renderGolf = (overrides: object = {}) => {
    const handlers = {
        onScoreOnlyModeChange: jest.fn(),
        onBadHoleReassuranceChange: jest.fn(),
    };
    const utils = render(<GolfSettings settings={{ ...settings, ...overrides }} {...handlers} />);
    return { ...utils, ...handlers };
};

describe('GolfSettings', () => {
    it('shouldShowTheGolfSectionWithItsTwoSwitches', () => {
        const { getByText, getByTestId } = renderGolf();

        expect(getByText('GOLF')).toBeTruthy();
        expect(getByText('Score-only mode')).toBeTruthy();
        expect(getByText('Bad hole reminder')).toBeTruthy();
        expect(getByTestId('score-only-switch')).toBeTruthy();
        expect(getByTestId('bad-hole-reassurance-switch')).toBeTruthy();
    });

    it('shouldNotShowAPreShotRoutineSwitchOrTextBox', () => {
        const { queryByText, queryByTestId } = renderGolf();

        expect(queryByText('Show pre-shot routine')).toBeNull();
        expect(queryByTestId('preshot-switch')).toBeNull();
        expect(queryByTestId('preshot-routine-input')).toBeNull();
    });

    it('shouldReflectEachSettingInItsSwitch', () => {
        const { getByTestId } = renderGolf({ skipStatsFlowEnabled: false, badHoleReassuranceEnabled: true });

        expect(getByTestId('score-only-switch').props.value).toBe(false);
        expect(getByTestId('bad-hole-reassurance-switch').props.value).toBe(true);
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
});
