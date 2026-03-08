import React, { act } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import View from '../../../app/short-game/chipping';
import { insertDrillResultService } from '@/service/DbService';

jest.mock('../../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

jest.mock('../../../hooks/useStyles', () => ({
    useStyles: () => require('../../../assets/stlyes').default,
}));

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

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ bottom: 0 }),
}));

jest.mock('@/service/DbService', () => ({
    insertDrillResultService: jest.fn().mockResolvedValue(true),
    getDrillsByCategoryService: jest.fn().mockReturnValue([
        { id: 4, label: 'Gate', iconName: 'horizontal-distribute', target: '10 / 10', objective: 'o', setup: 's', howToPlay: 'h' },
        { id: 5, label: 'Hoop', iconName: 'adjust', target: '8 / 10', objective: 'o', setup: 's', howToPlay: 'h' },
        { id: 6, label: 'One hand', iconName: 'back-hand', target: '8 / 10', objective: 'o', setup: 's', howToPlay: 'h' },
    ]),
    getGamesByCategoryService: jest.fn().mockReturnValue([
        { id: 4, header: 'Up & down challenge!', objective: 'o', setup: 's', howToPlay: 'h' },
        { id: 5, header: 'Ladder challenge!', objective: 'o', setup: 's', howToPlay: 'h' },
        { id: 6, header: 'Par 18!', objective: 'o', setup: 's', howToPlay: 'h' },
    ]),
    insertGameService: jest.fn().mockResolvedValue(true),
    deleteGameService: jest.fn().mockResolvedValue(true),
    restoreGameService: jest.fn().mockResolvedValue(true),
    deleteDrillService: jest.fn().mockResolvedValue(true),
    restoreDrillService: jest.fn().mockResolvedValue(true),
}));

jest.useFakeTimers();

describe('Chipping page ', () => {
    it('renders correctly with the default text', () => {
        const { getByText } = render(<View />);

        expect(getByText('Chipping drills')).toBeTruthy();
    });

    it('renders correctly the chipping drills', () => {
        const { getByText } = render(<View />);

        expect(getByText('Gate')).toBeTruthy();
        expect(getByText('Hoop')).toBeTruthy();
        expect(getByText('One hand')).toBeTruthy();
    });

    it('renders correctly with the games heading', () => {
        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('chipping-sub-menu-chipping-games');

        fireEvent.press(subMenuItem);

        expect(getByText('Chipping games')).toBeTruthy();
    });

    it('renders correctly with the games', () => {
        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('chipping-sub-menu-chipping-games');

        fireEvent.press(subMenuItem);

        expect(getByText('Up & down challenge!')).toBeTruthy();
        expect(getByText('Ladder challenge!')).toBeTruthy();
        expect(getByText('Par 18!')).toBeTruthy();
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
