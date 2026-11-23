import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import PuttWheel from '../../components/PuttWheel';

describe('PuttWheel', () => {
    it('shouldOfferEveryFootFromOneToTheMaximumAsAFtLabel', () => {
        const { getByTestId } = render(<PuttWheel testID="wheel" value={18} max={100} onChange={jest.fn()} />);
        const items = getByTestId('wheel').props.items;

        expect(items).toHaveLength(100);
        expect(items[0]).toEqual({ value: 1, label: '1 ft' });
        expect(items[99]).toEqual({ value: 100, label: '100 ft' });
    });

    it('shouldSelectTheCurrentDistance', () => {
        const { getByTestId } = render(<PuttWheel testID="wheel" value={18} max={100} onChange={jest.fn()} />);

        expect(getByTestId('wheel').props.selectedIndex).toBe(17);
    });

    it('shouldReportTheChosenDistanceAsANumber', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(<PuttWheel testID="wheel" value={18} max={100} onChange={onChange} />);

        fireEvent(getByTestId('wheel'), 'change', { nativeEvent: { newValue: 25, newIndex: 24 } });

        expect(onChange).toHaveBeenCalledWith(25);
    });
});
