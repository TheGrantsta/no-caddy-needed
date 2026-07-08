import React, { act } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import View from '../../../app/areas/bunker';
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
    useStyles: () => require('../../../assets/styles').default,
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
        { id: 10, label: 'Line', iconName: 'linear-scale', target: '8 / 10', objective: 'o', setup: 's', howToPlay: 'h' },
        { id: 11, label: 'Dollar bill', iconName: 'money', target: '8 / 10', objective: 'o', setup: 's', howToPlay: 'h' },
        { id: 12, label: 'No ball', iconName: 'sports-golf', target: '10 / 12', objective: 'o', setup: 's', howToPlay: 'h' },
    ]),
    getGamesByCategoryService: jest.fn().mockReturnValue([
        { id: 10, header: 'Up and down challenge!', objective: 'o', setup: 's', howToPlay: 'h' },
        { id: 11, header: 'Worst lie challenge!', objective: 'o', setup: 's', howToPlay: 'h' },
        { id: 12, header: '10-Point game!', objective: 'o', setup: 's', howToPlay: 'h' },
    ]),
    insertGameService: jest.fn().mockResolvedValue(true),
    deleteGameService: jest.fn().mockResolvedValue(true),
    restoreGameService: jest.fn().mockResolvedValue(true),
    deleteDrillService: jest.fn().mockResolvedValue(true),
    restoreDrillService: jest.fn().mockResolvedValue(true),
}));

jest.useFakeTimers();

describe('Bunker page ', () => {
    it('renders correctly with the default text', () => {
        const { getByText } = render(<View />);

        expect(getByText('Bunker tests')).toBeTruthy();
    });

    it('renders correctly the bunker drills', () => {
        const { getByText } = render(<View />);

        expect(getByText('Line')).toBeTruthy();
        expect(getByText('Dollar bill')).toBeTruthy();
        expect(getByText('No ball')).toBeTruthy();
    });

    it('renders correctly with the games', () => {
        const { getByText } = render(<View />);

        expect(getByText('Up and down challenge!')).toBeTruthy();
        expect(getByText('Worst lie challenge!')).toBeTruthy();
        expect(getByText('10-Point game!')).toBeTruthy();
    });

    it('renders correctly save buttons', () => {
        const { getAllByTestId } = render(<View />);

        const saveButtons = getAllByTestId('save-drill-result-button');
        expect(saveButtons.length).toBeGreaterThan(0);
    });
});
