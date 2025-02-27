import * as React from 'react';
import { render } from '@testing-library/react-native';
import Homepage from '../app/(tabs)/index';

describe('renders homepage', () => {
    it('shows title', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Golfers seeking smarter practice & setting better on course expectations')).toBeTruthy();
    });
});
