import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import ClubDistanceList from '../../components/ClubDistanceList';

describe('ClubDistanceList component', () => {
    const mockDistances = [
        { Id: 1, Club: 'Driver', CarryDistance: 250, SortOrder: 1 },
        { Id: 2, Club: '3 Wood', CarryDistance: 230, SortOrder: 2 },
        { Id: 3, Club: '5 Iron', CarryDistance: 180, SortOrder: 3 },
    ];

    describe('read-only mode', () => {
        it('displays club names', () => {
            const { getByText } = render(
                <ClubDistanceList distances={mockDistances} editable={false} />
            );

            expect(getByText('Driver')).toBeTruthy();
            expect(getByText('3 Wood')).toBeTruthy();
            expect(getByText('5 Iron')).toBeTruthy();
        });

        it('displays carry distances', () => {
            const { getByText } = render(
                <ClubDistanceList distances={mockDistances} editable={false} />
            );

            expect(getByText('250')).toBeTruthy();
            expect(getByText('230')).toBeTruthy();
            expect(getByText('180')).toBeTruthy();
        });

        it('displays table headers', () => {
            const { getByText } = render(
                <ClubDistanceList distances={mockDistances} editable={false} />
            );

            expect(getByText('Club')).toBeTruthy();
            expect(getByText('Carry (yards)')).toBeTruthy();
        });

        it('shows empty message when no distances', () => {
            const { getByText } = render(
                <ClubDistanceList distances={[]} editable={false} />
            );

            expect(getByText('No club distances set')).toBeTruthy();
        });
    });

    describe('editable mode', () => {
        const mockOnSave = jest.fn();

        it('shows input fields for editing', () => {
            const { getByTestId } = render(
                <ClubDistanceList distances={mockDistances} editable={true} onSave={mockOnSave} />
            );

            expect(getByTestId('club-input-0')).toBeTruthy();
            expect(getByTestId('distance-input-0')).toBeTruthy();
        });

        it('shows Save button', () => {
            const { getByTestId } = render(
                <ClubDistanceList distances={mockDistances} editable={true} onSave={mockOnSave} />
            );

            expect(getByTestId('save-distances-button')).toBeTruthy();
        });

        it('shows Add club button', () => {
            const { getByTestId } = render(
                <ClubDistanceList distances={[]} editable={true} onSave={mockOnSave} />
            );

            expect(getByTestId('add-club-button')).toBeTruthy();
        });

        it('adds a new row when Add club is pressed', () => {
            const { getByTestId } = render(
                <ClubDistanceList distances={[]} editable={true} onSave={mockOnSave} />
            );

            fireEvent.press(getByTestId('add-club-button'));

            expect(getByTestId('club-input-0')).toBeTruthy();
            expect(getByTestId('distance-input-0')).toBeTruthy();
        });
    });
});
