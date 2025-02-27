import * as React from 'react';
import { render } from '@testing-library/react-native';
import Chrevons from '@/components/Chevrons';

describe('renders chevrons', () => {
    it('shows heading', () => {
        const points: string[] = [];
        const { getByText } = render(<Chrevons heading='This is the heading' points={points} />);

        expect(getByText('This is the heading')).toBeTruthy();
    });

    it('shows items', () => {
        const points = ['Control low point', 'Improve centre strike', 'Enhance clubface control'];
        const { getByText } = render(<Chrevons heading='fake heading' points={points} />);

        expect(getByText('Control low point')).toBeTruthy();
        expect(getByText('Improve centre strike')).toBeTruthy();
        expect(getByText('Enhance clubface control')).toBeTruthy();
    });
});
