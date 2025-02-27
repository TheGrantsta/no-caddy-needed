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
        const points = ['Point 1', 'Point 2', 'Point 3'];
        const { getByText } = render(<Chrevons heading='fake heading' points={points} />);

        expect(getByText('Point 1')).toBeTruthy();
        expect(getByText('Point 2')).toBeTruthy();
        expect(getByText('Point 3')).toBeTruthy();
    });
});
