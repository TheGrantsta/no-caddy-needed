import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import ShortPuttingLadder from '../../../app/challenges/short-putting-ladder';
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

jest.mock('../../../hooks/useAppToast', () => ({
    useAppToast: () => ({
        showResult: jest.fn(),
        showError: jest.fn(),
    }),
}));

jest.mock('../../../service/DbService', () => ({
    insertDrillResultService: jest.fn(() => Promise.resolve(true)),
}));

describe('ShortPuttingLadder screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('showsTheCurrentLevelAndProgressOutOf7', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        expect(getByText('Level 1')).toBeTruthy();
        expect(getByText('of 7')).toBeTruthy();
        expect(getByTestId('simulation-progress-fill')).toHaveStyle({ width: `${(1 / 7) * 100}%` });
    });

    it('showsTheDistanceCardForTheCurrentLevel', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        expect(getByText('PUTT FROM')).toBeTruthy();
        expect(getByTestId('simulation-distance-value').props.children).toBe('4');
        expect(getByText('ft')).toBeTruthy();
    });

    it('showsFourAttemptTilesLabelledOneTwoThreeFourPlusWithOneSelectedByDefault', () => {
        const { getByText, getByTestId, queryByTestId } = render(<ShortPuttingLadder />);

        expect(getByText('PUTTS TAKEN')).toBeTruthy();
        expect(getByTestId('attempts-option-1')).toBeTruthy();
        expect(getByTestId('attempts-option-2')).toBeTruthy();
        expect(getByTestId('attempts-option-3')).toBeTruthy();
        expect(getByText('4+')).toBeTruthy();
        expect(queryByTestId('attempts-option-5')).toBeNull();
        expect(getByTestId('attempts-option-1')).toHaveStyle({ backgroundColor: '#2D5A3D' });
        expect(getByTestId('attempts-option-2')).toHaveStyle({ backgroundColor: '#fff' });
    });

    it('highlightsTheAttemptTileThatWasPressed', () => {
        const { getByTestId } = render(<ShortPuttingLadder />);

        fireEvent.press(getByTestId('attempts-option-3'));

        expect(getByTestId('attempts-option-3')).toHaveStyle({ backgroundColor: '#2D5A3D' });
        expect(getByTestId('attempts-option-1')).toHaveStyle({ backgroundColor: '#fff' });
    });

    it('navigatesToTheNextLevelWithTheLevelLabel', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        fireEvent.press(getByTestId('next-hole-button'));

        expect(getByText('Level 2')).toBeTruthy();
        expect(getByTestId('simulation-distance-value').props.children).toBe('5');
    });

    it('labelsTheLastLevelFinish', () => {
        const { getByTestId, getByText } = render(<ShortPuttingLadder />);

        for (let i = 0; i < 6; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }

        expect(getByText('Finish')).toBeTruthy();
    });

    it('showsCompleteViewAfterFinish', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        for (let i = 0; i < 7; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }

        expect(getByText(/Challenge complete/)).toBeTruthy();
        expect(getByTestId('play-again-button')).toBeTruthy();
    });

    it('displaysTotalAttemptsOnCompletion', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        for (let i = 0; i < 7; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }

        expect(getByText(/Total attempts/)).toBeTruthy();
    });

    it('autoSavesResultWhenFinishing', async () => {
        const { getByTestId } = render(<ShortPuttingLadder />);

        for (let i = 0; i < 7; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(insertDrillResultService).toHaveBeenCalled();
        const [name] = (insertDrillResultService as jest.Mock).mock.calls[0];
        expect(name).toBe('Short-Putting Ladder');
    });

    it('resetsToLevelOneOnPlayAgain', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        for (let i = 0; i < 7; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }

        fireEvent.press(getByTestId('play-again-button'));

        expect(getByText('Level 1')).toBeTruthy();
        expect(getByTestId('simulation-distance-value').props.children).toBe('4');
    });

    it('displaysPerformanceBandsOnCompletion', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        for (let i = 0; i < 7; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }

        expect(getByText('Pro')).toBeTruthy();
        expect(getByText('15 Handicap')).toBeTruthy();
    });

    it('opensTheEndOverlayWhenEndIsPressedDuringARun', () => {
        const { getByTestId, getByText } = render(<ShortPuttingLadder />);

        fireEvent.press(getByTestId('simulation-end-button'));

        expect(getByTestId('end-round-sheet')).toBeTruthy();
        expect(getByText('End simulation after level 1?')).toBeTruthy();
    });

    it('closesTheOverlayAndKeepsPlayingWhenKeepPlayingIsPressed', () => {
        const { getByTestId, queryByTestId } = render(<ShortPuttingLadder />);

        fireEvent.press(getByTestId('simulation-end-button'));
        fireEvent.press(getByTestId('end-round-keep-playing-button'));

        expect(queryByTestId('end-round-sheet')).toBeNull();
        expect(mockBack).not.toHaveBeenCalled();
    });

    it('savesAttemptsSoFarIncludingTheCurrentLevelWhenSaveIsPressed', () => {
        const { getByTestId } = render(<ShortPuttingLadder />);

        fireEvent.press(getByTestId('attempts-option-3'));
        fireEvent.press(getByTestId('next-hole-button'));
        fireEvent.press(getByTestId('attempts-option-2'));
        fireEvent.press(getByTestId('simulation-end-button'));
        fireEvent.press(getByTestId('end-round-save-button'));

        expect(insertDrillResultService).toHaveBeenCalledWith('Short-Putting Ladder', false, null, 5);
        expect(mockBack).toHaveBeenCalled();
    });

    it('discardsWithoutSavingAndLeavesWhenDiscardIsPressed', () => {
        const { getByTestId } = render(<ShortPuttingLadder />);

        fireEvent.press(getByTestId('next-hole-button'));
        fireEvent.press(getByTestId('simulation-end-button'));
        fireEvent.press(getByTestId('end-round-discard-button'));

        expect(insertDrillResultService).not.toHaveBeenCalled();
        expect(mockBack).toHaveBeenCalled();
    });

    it('leavesWithoutOverlayWhenEndIsPressedAfterCompletion', () => {
        const { getByTestId, queryByTestId } = render(<ShortPuttingLadder />);

        for (let i = 0; i < 7; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }
        fireEvent.press(getByTestId('simulation-end-button'));

        expect(mockBack).toHaveBeenCalled();
        expect(queryByTestId('end-round-sheet')).toBeNull();
    });

    it('hidesTheStackHeaderSoTheScreenShowsItsOwnAppBar', () => {
        render(<ShortPuttingLadder />);

        expect(mockSetOptions).toHaveBeenCalledWith(expect.objectContaining({ headerShown: false }));
    });

    it('asksBeforeLeavingWhenSwipeOrHardwareBackDuringRun', () => {
        mockAddListener.mockClear();
        const { getByText } = render(<ShortPuttingLadder />);
        const listener = mockAddListener.mock.calls.find((c: any[]) => c[0] === 'beforeRemove')?.[1];
        const event = { preventDefault: jest.fn(), data: { action: {} } };

        act(() => {
            listener?.(event);
        });

        expect(event.preventDefault).toHaveBeenCalled();
        expect(getByText('Quit challenge?')).toBeTruthy();
    });
});
