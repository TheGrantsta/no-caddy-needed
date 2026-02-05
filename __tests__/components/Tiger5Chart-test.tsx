import React from 'react';
import { render } from '@testing-library/react-native';
import Tiger5Chart from '../../components/Tiger5Chart';
import { Tiger5Round } from '@/service/DbService';
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

describe('Tiger5Chart component', () => {
    const mockRounds: Tiger5Round[] = [
        { Id: 1, ThreePutts: 3, DoubleBogeys: 1, BogeysPar5: 2, BogeysInside9Iron: 4, DoubleChips: 0, Total: 10, Created_At: '15/06' },
        { Id: 2, ThreePutts: 2, DoubleBogeys: 3, BogeysPar5: 1, BogeysInside9Iron: 1, DoubleChips: 2, Total: 9, Created_At: '16/06' },
    ];

    // Aggregated: ThreePutts=5, DoubleBogeys=4, BogeysPar5=3, BogeysInside9Iron=5, DoubleChips=2
    // Sorted desc: BogeysInside9Iron=5, ThreePutts=5, DoubleBogeys=4, BogeysPar5=3, DoubleChips=2

    it('returns null when rounds array is empty', () => {
        const { queryByText } = render(<Tiger5Chart rounds={[]} />);

        expect(queryByText('Tiger 5')).toBeNull();
    });

    it('returns null when rounds total score is zero', () => {
        const emptyRound: Tiger5Round[] = [
            { Id: 1, ThreePutts: 0, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, Total: 0, Created_At: '15/06' },
        ];
        const { queryByText } = render(<Tiger5Chart rounds={emptyRound} />);

        expect(queryByText('Tiger 5')).toBeNull();
    });

    it('renders the title', () => {
        const { getByText } = render(<Tiger5Chart rounds={mockRounds} />);

        expect(getByText('Tiger 5')).toBeTruthy();
    });

    it('renders all 5 category labels', () => {
        const { getAllByTestId } = render(<Tiger5Chart rounds={mockRounds} />);

        const labels = getAllByTestId('tiger5-chart-label');
        expect(labels).toHaveLength(5);
    });

    it('renders aggregated counts', () => {
        const { getByTestId } = render(<Tiger5Chart rounds={mockRounds} />);

        const counts = [
            getByTestId('tiger5-chart-count-0'),
            getByTestId('tiger5-chart-count-1'),
            getByTestId('tiger5-chart-count-2'),
            getByTestId('tiger5-chart-count-3'),
            getByTestId('tiger5-chart-count-4'),
        ];

        const countValues = counts.map(c => c.props.children);
        expect(countValues).toEqual([5, 5, 4, 3, 2]);
    });

    it('sorts categories by count descending', () => {
        const { getAllByTestId } = render(<Tiger5Chart rounds={mockRounds} />);

        const labels = getAllByTestId('tiger5-chart-label');
        const labelTexts = labels.map(l => l.props.children);

        // Both ThreePutts and BogeysInside9Iron are 5, stable sort preserves original order
        expect(labelTexts[0]).toBe('3-putts');
        expect(labelTexts[1]).toBe('Inside 9-iron');
        expect(labelTexts[4]).toBe('Double chips');
    });

    it('handles a single round', () => {
        const singleRound: Tiger5Round[] = [
            { Id: 1, ThreePutts: 1, DoubleBogeys: 0, BogeysPar5: 2, BogeysInside9Iron: 0, DoubleChips: 3, Total: 6, Created_At: '15/06' },
        ];

        const { getAllByTestId } = render(<Tiger5Chart rounds={singleRound} />);

        const labels = getAllByTestId('tiger5-chart-label');
        expect(labels).toHaveLength(5);
    });

    it('colors highest category bar red', () => {
        const { getByTestId } = render(<Tiger5Chart rounds={mockRounds} />);

        const bar = getByTestId('tiger5-chart-bar-0');
        const barStyle = Array.isArray(bar.props.style) ? Object.assign({}, ...bar.props.style) : bar.props.style;
        expect(barStyle.backgroundColor).toBe(colours.errorText);
    });

    it('colors lowest category bar green', () => {
        const { getByTestId } = render(<Tiger5Chart rounds={mockRounds} />);

        const bar = getByTestId('tiger5-chart-bar-4');
        const barStyle = Array.isArray(bar.props.style) ? Object.assign({}, ...bar.props.style) : bar.props.style;
        expect(barStyle.backgroundColor).toBe(colours.green);
    });

    it('colors middle categories yellow', () => {
        const { getByTestId } = render(<Tiger5Chart rounds={mockRounds} />);

        for (const i of [1, 2, 3]) {
            const bar = getByTestId(`tiger5-chart-bar-${i}`);
            const barStyle = Array.isArray(bar.props.style) ? Object.assign({}, ...bar.props.style) : bar.props.style;
            expect(barStyle.backgroundColor).toBe(colours.yellow);
        }
    });

    it('sets bar widths proportional to max count', () => {
        const { getByTestId } = render(<Tiger5Chart rounds={mockRounds} />);

        // Max count is 5, so index 0 should be 100%
        const bar0 = getByTestId('tiger5-chart-bar-0');
        const bar0Style = Array.isArray(bar0.props.style) ? Object.assign({}, ...bar0.props.style) : bar0.props.style;
        expect(bar0Style.width).toBe('100%');

        // DoubleChips = 2, so 2/5 * 100 = 40%
        const bar4 = getByTestId('tiger5-chart-bar-4');
        const bar4Style = Array.isArray(bar4.props.style) ? Object.assign({}, ...bar4.props.style) : bar4.props.style;
        expect(bar4Style.width).toBe('40%');
    });

    it('renders the legend', () => {
        const { getByText } = render(<Tiger5Chart rounds={mockRounds} />);

        expect(getByText('Biggest problem')).toBeTruthy();
    });
});
