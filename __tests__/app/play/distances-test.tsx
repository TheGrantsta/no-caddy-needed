import React from 'react';
import { render } from '@testing-library/react-native';
import DistancesScreen from '../../../app/play/distances';
import { getClubDistancesService } from '../../../service/DbService';

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

jest.mock('../../../service/DbService', () => ({
    getClubDistancesService: jest.fn(),
    saveClubDistancesService: jest.fn(),
}));

jest.mock('react-native-toast-notifications', () => ({
    useToast: () => ({
        show: jest.fn(),
    }),
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

const mockGetClubDistances = getClubDistancesService as jest.Mock;

describe('Distances screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders distances heading', () => {
        mockGetClubDistances.mockReturnValue([]);

        const { getByText } = render(<DistancesScreen />);

        expect(getByText('Distances')).toBeTruthy();
    });

    it('shows club distances when data exists', () => {
        mockGetClubDistances.mockReturnValue([
            { Id: 1, Club: 'Driver', CarryDistance: 250, TotalDistance: 270, SortOrder: 1 },
        ]);

        const { getByTestId, getByText } = render(<DistancesScreen />);

        expect(getByText('1 clubs in your bag')).toBeTruthy();
        expect(getByTestId('club-input-0').props.value).toBe('Driver');
        expect(getByTestId('distance-input-0').props.value).toBe('250');
    });

    it('shows empty message when no distances exist', () => {
        mockGetClubDistances.mockReturnValue([]);

        const { getByText } = render(<DistancesScreen />);

        expect(getByText('No clubs in your bag')).toBeTruthy();
    });

    it('shows add club button', () => {
        mockGetClubDistances.mockReturnValue([]);

        const { getByTestId } = render(<DistancesScreen />);

        expect(getByTestId('add-club-button')).toBeTruthy();
    });

    it('shows save button', () => {
        mockGetClubDistances.mockReturnValue([]);

        const { getByTestId } = render(<DistancesScreen />);

        expect(getByTestId('save-distances-button')).toBeTruthy();
    });
});
