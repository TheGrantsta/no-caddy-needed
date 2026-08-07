import React from 'react';
import { render } from '@testing-library/react-native';
import DoubleChipReasonPicker from '../../components/DoubleChipReasonPicker';
import Dropdown from '../../components/Dropdown';

jest.mock('../../components/Dropdown');

const mockDropdown = Dropdown as jest.Mock;

describe('DoubleChipReasonPicker', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDropdown.mockReturnValue('Dropdown');
    });

    it('renders Dropdown component', () => {
        render(<DoubleChipReasonPicker selectedReason={undefined} onSelectReason={() => {}} />);

        expect(mockDropdown).toHaveBeenCalled();
    });

    it('passes correct options to Dropdown', () => {
        render(<DoubleChipReasonPicker selectedReason={undefined} onSelectReason={() => {}} />);

        const call = mockDropdown.mock.calls[0][0];
        expect(call.options).toContain('Short sided');
        expect(call.options).toContain('Chunked');
        expect(call.options).toContain('Thinned');
        expect(call.options).toContain('Wrong club selection');
        expect(call.options).toContain('Other');
        expect(call.options).toHaveLength(5);
    });

    it('passes selectedReason to Dropdown', () => {
        render(<DoubleChipReasonPicker selectedReason="Chunked" onSelectReason={() => {}} />);

        const call = mockDropdown.mock.calls[0][0];
        expect(call.selectedOption).toBe('Chunked');
    });

    it('passes onSelectReason callback to Dropdown as onSelectOption', () => {
        const mockCallback = jest.fn();
        render(<DoubleChipReasonPicker selectedReason={undefined} onSelectReason={mockCallback} />);

        const call = mockDropdown.mock.calls[0][0];
        expect(call.onSelectOption).toBe(mockCallback);
    });

    it('passes correct placeholder and testIDPrefix', () => {
        render(<DoubleChipReasonPicker selectedReason={undefined} onSelectReason={() => {}} />);

        const call = mockDropdown.mock.calls[0][0];
        expect(call.placeholder).toBe('Select reason');
        expect(call.testIDPrefix).toBe('double-chip-reason-picker');
    });

    it('passes error props to Dropdown when showError is true', () => {
        render(
            <DoubleChipReasonPicker
                selectedReason={undefined}
                onSelectReason={() => {}}
                showError={true}
            />
        );

        const call = mockDropdown.mock.calls[0][0];
        expect(call.showError).toBe(true);
        expect(call.errorText).toBe('Required');
    });

    it('passes showError false by default', () => {
        render(<DoubleChipReasonPicker selectedReason={undefined} onSelectReason={() => {}} />);

        const call = mockDropdown.mock.calls[0][0];
        expect(call.showError).toBe(false);
    });
});
