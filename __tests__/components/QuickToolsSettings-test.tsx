import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import QuickToolsSettings from '../../components/QuickToolsSettings';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

const renderSettings = (quickTools = ['wind', 'tempo', 'random']) => {
    const onQuickToolsChange = jest.fn();
    const utils = render(<QuickToolsSettings quickTools={quickTools} onQuickToolsChange={onQuickToolsChange} />);
    return { ...utils, onQuickToolsChange };
};

describe('QuickToolsSettings', () => {
    it('shouldShowTheSectionTitleAndWhatItControls', () => {
        const { getByText } = renderSettings();

        expect(getByText('QUICK TOOLS')).toBeTruthy();
        expect(getByText('Choose three challenges or tools for the Home screen.')).toBeTruthy();
    });

    it('shouldShowTheCurrentThreeToolsInTheirSlots', () => {
        const { getByTestId } = renderSettings(['lag-putting', 'reminders', 'wind']);

        expect(getByTestId('quick-tool-0-dropdown-toggle')).toHaveTextContent(/Lag putting/);
        expect(getByTestId('quick-tool-1-dropdown-toggle')).toHaveTextContent(/Reminders/);
        expect(getByTestId('quick-tool-2-dropdown-toggle')).toHaveTextContent(/Wind/);
    });

    it('shouldNotOfferToolsAlreadyChosenInAnotherSlot', () => {
        const { getByTestId, queryByTestId } = renderSettings();

        fireEvent.press(getByTestId('quick-tool-0-dropdown-toggle'));

        expect(getByTestId('quick-tool-0-option-Wind')).toBeTruthy();
        expect(getByTestId('quick-tool-0-option-Putting sim')).toBeTruthy();
        expect(queryByTestId('quick-tool-0-option-Tempo')).toBeNull();
        expect(queryByTestId('quick-tool-0-option-Random')).toBeNull();
    });

    it('shouldOfferChallengesAndToolsInEachSlot', () => {
        const { getByTestId } = renderSettings();

        fireEvent.press(getByTestId('quick-tool-1-dropdown-toggle'));

        expect(getByTestId('quick-tool-1-option-Lag putting')).toBeTruthy();
        expect(getByTestId('quick-tool-1-option-Reminders')).toBeTruthy();
    });

    it('shouldSaveThreeToolsWithTheChosenSlotReplaced', () => {
        const { getByTestId, onQuickToolsChange } = renderSettings();

        fireEvent.press(getByTestId('quick-tool-0-dropdown-toggle'));
        fireEvent.press(getByTestId('quick-tool-0-option-Lag putting'));

        expect(onQuickToolsChange).toHaveBeenCalledWith(['lag-putting', 'tempo', 'random']);
    });

    it('shouldNeverSaveFewerOrMoreThanThreeTools', () => {
        const { getByTestId, onQuickToolsChange } = renderSettings();

        fireEvent.press(getByTestId('quick-tool-2-dropdown-toggle'));
        fireEvent.press(getByTestId('quick-tool-2-option-Up-and-down'));

        const saved = onQuickToolsChange.mock.calls[0][0];
        expect(saved).toHaveLength(3);
        expect(new Set(saved).size).toBe(3);
    });
});
