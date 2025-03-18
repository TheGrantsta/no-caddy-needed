import React, { act } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import View from '../../../app/short-game/pitching';
import { insertDrillResultService } from '@/service/DbService';

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest
            .fn()
            .mockImplementation(({ children }) => children),
    };
});

jest.mock('react-native-toast-notifications', () => ({
    useToast: () => ({
        show: jest.fn(),
    }),
}));

jest.mock('@/service/DbService', () => ({
    insertDrillResultService: jest.fn().mockResolvedValue(true),
}));

jest.useFakeTimers();

describe('Pitching page ', () => {
    it('renders correctly with the default text', () => {
        const { getByText } = render(<View />);

        expect(getByText('Pitching drills')).toBeTruthy();
    });

    it('renders correctly the pitching drills', () => {
        const { getByText } = render(<View />);

        expect(getByText('Three ball')).toBeTruthy();
        expect(getByText('Wedge')).toBeTruthy();
        expect(getByText('Ladder')).toBeTruthy();
    });

    it('renders correctly with the games heading', () => {
        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('pitching-sub-menu-pitching-games');

        fireEvent.press(subMenuItem);

        expect(getByText('Pitching games')).toBeTruthy();
    });

    it('renders correctly with the games', () => {
        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('pitching-sub-menu-pitching-games');

        fireEvent.press(subMenuItem);

        expect(getByText('Three club!')).toBeTruthy();
        expect(getByText('Target challenge!')).toBeTruthy();
        expect(getByText('5-ball game!')).toBeTruthy();
    });

    it('calls insert button when saving drill result', () => {
        const { getAllByTestId } = render(<View />);

        const saveButtons = getAllByTestId('save-drill-result-button');
        expect(saveButtons).toHaveLength(3);

        act(() => {
            fireEvent.press(saveButtons[0]);

            jest.runOnlyPendingTimers();
            jest.advanceTimersByTime(1000);

            expect(insertDrillResultService).toHaveBeenCalledTimes(1);
        });
    });
});
