import React from 'react';
import { render } from '@testing-library/react-native';
import DistancesScreen from '../../../app/play/distances';
import { getClubDistancesService } from '../../../service/DbService';

jest.mock('../../../service/DbService', () => ({
    getClubDistancesService: jest.fn(),
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
            { Id: 1, Club: 'Driver', CarryDistance: 250, SortOrder: 1 },
        ]);

        const { getByText } = render(<DistancesScreen />);

        expect(getByText('Driver')).toBeTruthy();
        expect(getByText('250')).toBeTruthy();
    });

    it('shows empty message when no distances exist', () => {
        mockGetClubDistances.mockReturnValue([]);

        const { getByText } = render(<DistancesScreen />);

        expect(getByText('No club distances set')).toBeTruthy();
    });
});
