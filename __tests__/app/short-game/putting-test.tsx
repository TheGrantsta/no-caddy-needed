import React, { act } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import View from '../../../app/short-game/putting';
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
        { id: 1, label: 'Gate', iconName: 'data-array', target: '8 / 10', objective: 'o', setup: 's', howToPlay: 'h' },
        { id: 2, label: 'Clock', iconName: 'schedule', target: '8 / 10', objective: 'o', setup: 's', howToPlay: 'h' },
        { id: 3, label: 'Ladder', iconName: 'sort', target: '10 / 12', objective: 'o', setup: 's', howToPlay: 'h' },
    ]),
    getGamesByCategoryService: jest.fn().mockReturnValue([
        { id: 1, header: 'Around the world!', objective: 'o', setup: 's', howToPlay: 'h' },
        { id: 2, header: 'Ladder challenge!', objective: 'o', setup: 's', howToPlay: 'h' },
        { id: 3, header: 'Par 18!', objective: 'o', setup: 's', howToPlay: 'h' },
    ]),
    insertGameService: jest.fn().mockResolvedValue(true),
    deleteGameService: jest.fn().mockResolvedValue(true),
    restoreGameService: jest.fn().mockResolvedValue(true),
    deleteDrillService: jest.fn().mockResolvedValue(true),
    restoreDrillService: jest.fn().mockResolvedValue(true),
}));

jest.useFakeTimers();

describe('Putting page ', () => {
    it('renders correctly with the default text', () => {
        const { getByText } = render(<View />);

        expect(getByText('Putting drills')).toBeTruthy();
    });

    it('renders correctly the putting drills', () => {
        const { getByText } = render(<View />);

        expect(getByText('Clock')).toBeTruthy();
    });

    it('renders correctly with the games heading', () => {
        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('putting-sub-menu-putting-games');

        fireEvent.press(subMenuItem);

        expect(getByText('Putting games')).toBeTruthy();
    });

    it('renders correctly with the games', () => {
        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('putting-sub-menu-putting-games');

        fireEvent.press(subMenuItem);

        expect(getByText('Around the world!')).toBeTruthy();
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
