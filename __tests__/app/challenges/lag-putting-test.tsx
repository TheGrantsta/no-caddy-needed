import React from 'react';
import { render, fireEvent, act, within } from '@testing-library/react-native';
import LagPutting from '../../../app/challenges/lag-putting';
import { insertDrillResultService } from '../../../service/DbService';

const mockAddListener = jest.fn(() => jest.fn());
const mockSetOptions = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
    useNavigation: () => ({ goBack: jest.fn(), setOptions: mockSetOptions, addListener: mockAddListener }),
    useRouter: () => ({ back: mockBack }),
}));

jest.mock('react-native-gesture-handler', () => ({
    GestureHandlerRootView: ({ children }: any) => children,
}));

jest.mock('../../../hooks/useStyles', () => ({
    useStyles: () => require('../../../assets/styles').default,
}));

jest.mock('../../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../../assets/colours').default,
}));

jest.mock('../../../hooks/useAppToast', () => ({
    useAppToast: () => ({
        showResult: jest.fn(),
        showError: jest.fn(),
    }),
}));

jest.mock('../../../service/DbService', () => ({
    insertDrillResultService: jest.fn(() => Promise.resolve(true)),
}));

// Opens the total-putts dropdown and picks a value
const chooseScore = (getByTestId: (id: string) => any, score: number) => {
    fireEvent.press(getByTestId('score-dropdown-toggle'));
    fireEvent.press(getByTestId(`score-option-${score}`));
};

describe('LagPutting screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('showsTheTitleAndAnEndButtonInTheAppBar', () => {
        const { getByText, getByTestId } = render(<LagPutting />);

        expect(getByText('Lag putting')).toBeTruthy();
        expect(getByTestId('simulation-end-button')).toBeTruthy();
    });

    it('hidesTheStackHeaderSoTheScreenShowsItsOwnAppBar', () => {
        render(<LagPutting />);

        expect(mockSetOptions).toHaveBeenCalledWith(expect.objectContaining({ headerShown: false }));
    });

    it('showsATotalPuttsCardWithZeroByDefault', () => {
        const { getByText, getByTestId } = render(<LagPutting />);

        expect(getByText('TOTAL PUTTS')).toBeTruthy();
        expect(getByTestId('simulation-distance-value').props.children).toBe('0');
        expect(getByText('putts')).toBeTruthy();
    });

    it('titlesTheScoreDropdownTotalPutts', () => {
        const { getByText } = render(<LagPutting />);

        expect(getByText('Total putts')).toBeTruthy();
    });

    it('showsAScoreDropdownWithZeroByDefault', () => {
        const { getByTestId } = render(<LagPutting />);

        expect(within(getByTestId('score-dropdown-toggle')).getByText('0')).toBeTruthy();
    });

    it('offersScoresFromZeroToThirtyInTheDropdown', () => {
        const { getByTestId, queryByTestId } = render(<LagPutting />);

        fireEvent.press(getByTestId('score-dropdown-toggle'));

        expect(getByTestId('score-option-0')).toBeTruthy();
        expect(getByTestId('score-option-15')).toBeTruthy();
        expect(getByTestId('score-option-30')).toBeTruthy();
        expect(queryByTestId('score-option-31')).toBeNull();
    });

    it('showsTheChosenScoreInTheDropdownAndTheCard', () => {
        const { getByTestId } = render(<LagPutting />);

        chooseScore(getByTestId, 18);

        expect(within(getByTestId('score-dropdown-toggle')).getByText('18')).toBeTruthy();
        expect(getByTestId('simulation-distance-value').props.children).toBe('18');
    });

    it('showsASubmitButton', () => {
        const { getByTestId } = render(<LagPutting />);

        expect(getByTestId('submit-button')).toBeTruthy();
    });

    it('showsSetupAndHowToPlayAsCollapsedCardsThatOpenToTheirPoints', () => {
        const { getByTestId, getByText, queryByText } = render(<LagPutting />);

        expect(getByText('Setup')).toBeTruthy();
        expect(getByText('How to play')).toBeTruthy();
        expect(queryByText(/Place tee 1 in the ground/)).toBeNull();
        expect(queryByText(/First putt must reach tee 2/)).toBeNull();

        fireEvent.press(getByTestId('setup-row'));
        expect(getByText(/Place tee 1 in the ground/)).toBeTruthy();
        expect(queryByText(/First putt must reach tee 2/)).toBeNull();

        fireEvent.press(getByTestId('how-to-play-row'));
        expect(getByText(/First putt must reach tee 2/)).toBeTruthy();
    });

    it('showsCompleteViewAfterSubmit', () => {
        const { getByText, getByTestId } = render(<LagPutting />);

        chooseScore(getByTestId, 2);
        fireEvent.press(getByTestId('submit-button'));

        expect(getByText(/Challenge complete/)).toBeTruthy();
        expect(getByTestId('play-again-button')).toBeTruthy();
    });

    it('displaysTheChosenScoreOnCompletion', () => {
        const { getByText, getByTestId } = render(<LagPutting />);

        chooseScore(getByTestId, 3);
        fireEvent.press(getByTestId('submit-button'));

        expect(getByText(/Score: 3/)).toBeTruthy();
    });

    it('autoSavesResultWhenSubmitting', async () => {
        const { getByTestId } = render(<LagPutting />);

        chooseScore(getByTestId, 1);
        fireEvent.press(getByTestId('submit-button'));

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(insertDrillResultService).toHaveBeenCalled();
        const [name] = (insertDrillResultService as jest.Mock).mock.calls[0];
        expect(name).toBe('Lag Putting');
    });

    it('resetsToScoreZeroOnPlayAgain', () => {
        const { getByText, getByTestId } = render(<LagPutting />);

        chooseScore(getByTestId, 1);
        fireEvent.press(getByTestId('submit-button'));

        fireEvent.press(getByTestId('play-again-button'));

        expect(getByText('Lag putting')).toBeTruthy();
        expect(getByTestId('simulation-distance-value').props.children).toBe('0');
    });

    it('displaysPerformanceLevelsOnCompletion', () => {
        const { getByText, getByTestId } = render(<LagPutting />);

        chooseScore(getByTestId, 1);
        fireEvent.press(getByTestId('submit-button'));

        expect(getByText('Beginner')).toBeTruthy();
        expect(getByText('Pro')).toBeTruthy();
    });

    it('opensTheEndOverlayWhenEndIsPressed', () => {
        const { getByTestId, getByText } = render(<LagPutting />);

        fireEvent.press(getByTestId('simulation-end-button'));

        expect(getByTestId('end-round-sheet')).toBeTruthy();
        expect(getByText('End lag putting?')).toBeTruthy();
    });

    it('closesTheOverlayAndKeepsPlayingWhenKeepPlayingIsPressed', () => {
        const { getByTestId, queryByTestId } = render(<LagPutting />);

        fireEvent.press(getByTestId('simulation-end-button'));
        fireEvent.press(getByTestId('end-round-keep-playing-button'));

        expect(queryByTestId('end-round-sheet')).toBeNull();
        expect(mockBack).not.toHaveBeenCalled();
    });

    it('savesTheCurrentScoreAndLeavesWhenSaveIsPressed', () => {
        const { getByTestId } = render(<LagPutting />);

        chooseScore(getByTestId, 4);
        fireEvent.press(getByTestId('simulation-end-button'));
        fireEvent.press(getByTestId('end-round-save-button'));

        expect(insertDrillResultService).toHaveBeenCalledWith('Lag Putting', false, null, 4);
        expect(mockBack).toHaveBeenCalled();
    });

    it('discardsWithoutSavingAndLeavesWhenDiscardIsPressed', () => {
        const { getByTestId } = render(<LagPutting />);

        chooseScore(getByTestId, 4);
        fireEvent.press(getByTestId('simulation-end-button'));
        fireEvent.press(getByTestId('end-round-discard-button'));

        expect(insertDrillResultService).not.toHaveBeenCalled();
        expect(mockBack).toHaveBeenCalled();
    });

    it('leavesWithoutOverlayWhenEndIsPressedAfterSubmitting', () => {
        const { getByTestId, queryByTestId } = render(<LagPutting />);

        fireEvent.press(getByTestId('submit-button'));
        fireEvent.press(getByTestId('simulation-end-button'));

        expect(mockBack).toHaveBeenCalled();
        expect(queryByTestId('end-round-sheet')).toBeNull();
    });

    it('asksBeforeLeavingWhenSwipeOrHardwareBackDuringRun', () => {
        mockAddListener.mockClear();
        const { getByText } = render(<LagPutting />);
        const listener = mockAddListener.mock.calls.find((c: any[]) => c[0] === 'beforeRemove')?.[1];
        const event = { preventDefault: jest.fn(), data: { action: {} } };

        act(() => {
            listener?.(event);
        });

        expect(event.preventDefault).toHaveBeenCalled();
        expect(getByText('Quit challenge?')).toBeTruthy();
    });
});
