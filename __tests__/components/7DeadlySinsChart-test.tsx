import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import DeadlySinsChart from '../../components/DeadlySinsChart';
import { DeadlySinsRound } from '@/service/DbService';
import colours from '../../assets/colours';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

describe('DeadlySinsChart component', () => {
    const mockRounds: DeadlySinsRound[] = [
        { Id: 1, ThreePutts: 3, DoubleBogeys: 1, BogeysPar5: 2, BogeysInside9Iron: 4, DoubleChips: 0, TroubleOffTee: 1, Penalties: 2, Total: 13, RoundId: 1, Created_At: '15/06' },
        { Id: 2, ThreePutts: 2, DoubleBogeys: 3, BogeysPar5: 1, BogeysInside9Iron: 1, DoubleChips: 2, TroubleOffTee: 3, Penalties: 1, Total: 13, RoundId: 1, Created_At: '16/06' },
    ];

    it('returns null when rounds array is empty', () => {
        const { queryByText } = render(<DeadlySinsChart rounds={[]} />);

        expect(queryByText('7 Deadly Sins')).toBeNull();
    });

    it('returns null when rounds total score is zero', () => {
        const emptyRound: DeadlySinsRound[] = [
            { Id: 1, ThreePutts: 0, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 0, RoundId: 1, Created_At: '15/06' },
        ];
        const { queryByText } = render(<DeadlySinsChart rounds={emptyRound} />);

        expect(queryByText('7 Deadly Sins')).toBeNull();
    });

    it('renders the title', () => {
        const { getByText } = render(<DeadlySinsChart rounds={mockRounds} />);

        expect(getByText('7 Deadly Sins')).toBeTruthy();
    });

    it('renders all 7 category labels', () => {
        const { getAllByTestId } = render(<DeadlySinsChart rounds={mockRounds} />);

        const labels = getAllByTestId('7deadly-sins-chart-label');
        expect(labels).toHaveLength(7);
    });

    it('renders aggregated counts', () => {
        const { getByTestId } = render(<DeadlySinsChart rounds={mockRounds} />);

        const counts = [
            getByTestId('7deadly-sins-chart-count-0'),
            getByTestId('7deadly-sins-chart-count-1'),
            getByTestId('7deadly-sins-chart-count-2'),
            getByTestId('7deadly-sins-chart-count-3'),
            getByTestId('7deadly-sins-chart-count-4'),
            getByTestId('7deadly-sins-chart-count-5'),
            getByTestId('7deadly-sins-chart-count-6'),
        ];

        const countValues = counts.map(c => c.props.children);
        expect(countValues).toEqual([5, 5, 4, 4, 3, 3, 2]);
    });

    it('sorts categories by count descending', () => {
        const { getAllByTestId } = render(<DeadlySinsChart rounds={mockRounds} />);

        const labels = getAllByTestId('7deadly-sins-chart-label');
        const labelTexts = labels.map(l => l.props.children);

        // Both ThreePutts and BogeysInside9Iron are 5, stable sort preserves original order
        expect(labelTexts[0]).toBe('3-putts');
        expect(labelTexts[1]).toBe('Bogeys inside 9-iron');
        expect(labelTexts[6]).toBe('Double chips');
    });

    it('handles a single round', () => {
        const singleRound: DeadlySinsRound[] = [
            { Id: 1, ThreePutts: 1, DoubleBogeys: 0, BogeysPar5: 2, BogeysInside9Iron: 0, DoubleChips: 3, TroubleOffTee: 1, Penalties: 0, Total: 7, RoundId: 1, Created_At: '15/06' },
        ];

        const { getAllByTestId } = render(<DeadlySinsChart rounds={singleRound} />);

        const labels = getAllByTestId('7deadly-sins-chart-label');
        expect(labels).toHaveLength(7);
    });

    it('colors highest category bar red', () => {
        const { getByTestId } = render(<DeadlySinsChart rounds={mockRounds} />);

        const bar = getByTestId('7deadly-sins-chart-bar-0');
        const barStyle = Array.isArray(bar.props.style) ? Object.assign({}, ...bar.props.style) : bar.props.style;
        expect(barStyle.backgroundColor).toBe(colours.errorText);
    });

    it('colors lowest category bar green', () => {
        const { getByTestId } = render(<DeadlySinsChart rounds={mockRounds} />);

        const bar = getByTestId('7deadly-sins-chart-bar-6');
        const barStyle = Array.isArray(bar.props.style) ? Object.assign({}, ...bar.props.style) : bar.props.style;
        expect(barStyle.backgroundColor).toBe(colours.green);
    });

    it('colors middle categories yellow', () => {
        const { getByTestId } = render(<DeadlySinsChart rounds={mockRounds} />);

        for (const i of [1, 2, 3, 4, 5]) {
            const bar = getByTestId(`7deadly-sins-chart-bar-${i}`);
            const barStyle = Array.isArray(bar.props.style) ? Object.assign({}, ...bar.props.style) : bar.props.style;
            expect(barStyle.backgroundColor).toBe(colours.yellow);
        }
    });

    it('sets bar widths proportional to max count', () => {
        const { getByTestId } = render(<DeadlySinsChart rounds={mockRounds} />);

        // Max count is 5, so index 0 should be 100%
        const bar0 = getByTestId('7deadly-sins-chart-bar-0');
        const bar0Style = Array.isArray(bar0.props.style) ? Object.assign({}, ...bar0.props.style) : bar0.props.style;
        expect(bar0Style.width).toBe('100%');

        // DoubleChips = 2, so 2/5 * 100 = 40%
        const bar6 = getByTestId('7deadly-sins-chart-bar-6');
        const bar6Style = Array.isArray(bar6.props.style) ? Object.assign({}, ...bar6.props.style) : bar6.props.style;
        expect(bar6Style.width).toBe('40%');
    });

    it('renders the legend', () => {
        const { getByText } = render(<DeadlySinsChart rounds={mockRounds} />);

        expect(getByText('Biggest problem')).toBeTruthy();
    });

    describe('open/close toggle', () => {
        it('shows toggle header when rounds are provided', () => {
            const { getByTestId } = render(<DeadlySinsChart rounds={mockRounds} />);

            expect(getByTestId('7deadly-sins-chart-toggle')).toBeTruthy();
        });

        it('does not show toggle when component returns null', () => {
            const { queryByTestId } = render(<DeadlySinsChart rounds={[]} />);

            expect(queryByTestId('7deadly-sins-chart-toggle')).toBeNull();
        });

        it('chart content is open by default', () => {
            const { getAllByTestId } = render(<DeadlySinsChart rounds={mockRounds} />);

            expect(getAllByTestId('7deadly-sins-chart-label')).toHaveLength(7);
        });

        it('pressing toggle hides chart content', () => {
            const { getByTestId, queryByTestId } = render(<DeadlySinsChart rounds={mockRounds} />);

            fireEvent.press(getByTestId('7deadly-sins-chart-toggle'));

            expect(queryByTestId('7deadly-sins-chart-label')).toBeNull();
        });

        it('pressing toggle again shows chart content', () => {
            const { getByTestId, getAllByTestId } = render(<DeadlySinsChart rounds={mockRounds} />);

            fireEvent.press(getByTestId('7deadly-sins-chart-toggle'));
            fireEvent.press(getByTestId('7deadly-sins-chart-toggle'));

            expect(getAllByTestId('7deadly-sins-chart-label')).toHaveLength(7);
        });
    });
});
