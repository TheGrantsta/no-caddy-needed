import React from 'react';
import { render } from '@testing-library/react-native';
import Instructions from '../../components/Instructions';

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/stlyes').default,
}));

describe('Instructions component', () => {
    const defaultProps = {
        objective: 'Complete 5 successful putts',
        setUp: 'Place 5 balls around the hole',
        howToPlay: 'Putt each ball and track successes',
    };

    it('renders the Objective label', () => {
        const { getByText } = render(<Instructions {...defaultProps} />);

        expect(getByText('Objective:')).toBeTruthy();
    });

    it('renders the objective text', () => {
        const { getByText } = render(<Instructions {...defaultProps} />);

        expect(getByText(/Complete 5 successful putts/)).toBeTruthy();
    });

    it('renders the Setup label', () => {
        const { getByText } = render(<Instructions {...defaultProps} />);

        expect(getByText('Setup:')).toBeTruthy();
    });

    it('renders the setup text', () => {
        const { getByText } = render(<Instructions {...defaultProps} />);

        expect(getByText(/Place 5 balls around the hole/)).toBeTruthy();
    });

    it('renders the How to play label', () => {
        const { getByText } = render(<Instructions {...defaultProps} />);

        expect(getByText('How to play:')).toBeTruthy();
    });

    it('renders the how to play text', () => {
        const { getByText } = render(<Instructions {...defaultProps} />);

        expect(getByText(/Putt each ball and track successes/)).toBeTruthy();
    });

    it('renders all sections together', () => {
        const { getByText } = render(<Instructions {...defaultProps} />);

        expect(getByText('Objective:')).toBeTruthy();
        expect(getByText('Setup:')).toBeTruthy();
        expect(getByText('How to play:')).toBeTruthy();
    });

    it('renders with different props', () => {
        const customProps = {
            objective: 'Custom objective',
            setUp: 'Custom setup',
            howToPlay: 'Custom how to play',
        };

        const { getByText } = render(<Instructions {...customProps} />);

        expect(getByText(/Custom objective/)).toBeTruthy();
        expect(getByText(/Custom setup/)).toBeTruthy();
        expect(getByText(/Custom how to play/)).toBeTruthy();
    });

    it('renders with empty strings', () => {
        const emptyProps = {
            objective: '',
            setUp: '',
            howToPlay: '',
        };

        const { getByText } = render(<Instructions {...emptyProps} />);

        expect(getByText('Objective:')).toBeTruthy();
        expect(getByText('Setup:')).toBeTruthy();
        expect(getByText('How to play:')).toBeTruthy();
    });
});
