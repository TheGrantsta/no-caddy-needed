import { fireEvent, render } from '@testing-library/react-native';
import WedgeChart from '../../components/WedgeChart';
import { getWedgeChartService } from '../../service/DbService';

jest.mock('../../service/DbService', () => ({
    getWedgeChartService: jest.fn()
}));

describe('Wedge chart component', () => {
    it('renders heading', () => {
        getWedgeChartService.mockReturnValue([]);
        const { getByText } = render(<WedgeChart isShowButtons={false} />)

        expect(getByText('Wedge chart')).toBeTruthy();
    });

    it('renders add button', () => {
        getWedgeChartService.mockReturnValue([]);
        const { getByTestId } = render(<WedgeChart isShowButtons={true} />);

        expect(getByTestId('add-button')).toBeTruthy();
    });

    it('does NOT render add button when isShowButtons to false', () => {
        const { queryByTestId } = render(<WedgeChart isShowButtons={false} />);

        expect(queryByTestId('add-button')).toBeNull();
    });

    it('renders default text if wedge chart has not been set', () => {
        getWedgeChartService.mockReturnValue([]);
        const { getByText } = render(<WedgeChart isShowButtons={true} />);

        expect(getByText('Wedge chart not set (see Settings page)')).toBeTruthy();
    });

    it('renders edit button if wedge chart is set', () => {
        const data = [
            ['PW', '100', '110', '120']
        ];

        getWedgeChartService.mockReturnValue(data);
        const { getByText } = render(<WedgeChart isShowButtons={true} />)

        expect(getByText('Edit')).toBeTruthy();
    });

    it('renders wedge chart heading and row', () => {
        const data = [
            ['Swing/Wedge', '1/2', '3/4', 'Full'],
            ['PW', '100', '110', '120']
        ];

        getWedgeChartService.mockReturnValue(data);
        const { getByText } = render(<WedgeChart isShowButtons={true} />)

        expect(getByText('Swing/Wedge')).toBeTruthy();
        expect(getByText('1/2')).toBeTruthy();
        expect(getByText('3/4')).toBeTruthy();
        expect(getByText('Full')).toBeTruthy();

        expect(getByText('PW')).toBeTruthy();
        expect(getByText('100')).toBeTruthy();
        expect(getByText('110')).toBeTruthy();
        expect(getByText('120')).toBeTruthy();
    });

    it('renders save and cancel buttons when wedge chart is set and edit button clicked', async () => {
        const data = [
            ['PW', '100', '110', '120']
        ];

        getWedgeChartService.mockReturnValue(data);
        const { getByText, getByTestId } = render(<WedgeChart isShowButtons={true} />)

        expect(getByText('Edit')).toBeTruthy();

        const button = getByTestId('add-button');

        fireEvent.press(button);

        expect(getByText('Cancel')).toBeTruthy();
        expect(getByText('Save')).toBeTruthy();
    });
});
