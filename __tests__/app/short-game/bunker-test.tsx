import React, { act } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import View from '../../../app/short-game/bunker';
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

jest.mock('@/service/DbService', () => ({
    insertDrillResultService: jest.fn().mockResolvedValue(true),
}));

jest.useFakeTimers();

describe('Bunker page ', () => {
    it('renders correctly with the default text', () => {
        const { getByText } = render(<View />);

        expect(getByText('Bunker drills')).toBeTruthy();
    });

    it('renders correctly the bunker drills', () => {
        const { getByText } = render(<View />);

        expect(getByText('Line')).toBeTruthy();
        expect(getByText('Dollar bill')).toBeTruthy();
        expect(getByText('No ball')).toBeTruthy();
    });

    it('renders correctly with the games heading', () => {
        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('bunker-sub-menu-bunker-games');

        fireEvent.press(subMenuItem);

        expect(getByText('Bunker games')).toBeTruthy();
    });

    it('renders correctly with the games', () => {
        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('bunker-sub-menu-bunker-games');

        fireEvent.press(subMenuItem);

        expect(getByText('Up and down challenge!')).toBeTruthy();
        expect(getByText('Worst lie challenge!')).toBeTruthy();
        expect(getByText('10-Point game!')).toBeTruthy();
    });

    it('switches back to drills section when SubMenu is used', () => {
        const { getByTestId, getByText } = render(<View />);

        let subMenuItem = getByTestId('bunker-sub-menu-bunker-games');

        fireEvent.press(subMenuItem);

        expect(getByText('Bunker games')).toBeTruthy();

        subMenuItem = getByTestId('bunker-sub-menu-bunker-drills');

        fireEvent.press(subMenuItem);

        expect(getByText('Bunker drills')).toBeTruthy();
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
