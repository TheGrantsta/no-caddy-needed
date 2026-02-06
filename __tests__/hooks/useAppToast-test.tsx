import { renderHook } from '@testing-library/react-native';
import { useAppToast } from '@/hooks/useAppToast';
import { useToast } from 'react-native-toast-notifications';

jest.mock('react-native-toast-notifications', () => ({
    useToast: jest.fn(),
}));

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

const mockUseToast = useToast as jest.Mock;

describe('useAppToast', () => {
    const mockShow = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseToast.mockReturnValue({ show: mockShow });
    });

    it('showSuccess displays toast with success styling', () => {
        const { result } = renderHook(() => useAppToast());

        result.current.showSuccess('Operation completed');

        expect(mockShow).toHaveBeenCalledWith('Operation completed', expect.objectContaining({
            type: 'success',
        }));
        expect(mockShow).toHaveBeenCalledWith('Operation completed', expect.objectContaining({
            style: expect.objectContaining({
                borderLeftColor: '#00C851',
                borderLeftWidth: 10,
                backgroundColor: '#ffd33d',
            }),
        }));
    });

    it('showError displays toast with error styling', () => {
        const { result } = renderHook(() => useAppToast());

        result.current.showError('Operation failed');

        expect(mockShow).toHaveBeenCalledWith('Operation failed', expect.objectContaining({
            type: 'danger',
        }));
        expect(mockShow).toHaveBeenCalledWith('Operation failed', expect.objectContaining({
            style: expect.objectContaining({
                borderLeftColor: '#fd0303',
                borderLeftWidth: 10,
                backgroundColor: '#ffd33d',
            }),
        }));
    });

    it('showResult shows success toast when result is true', () => {
        const { result } = renderHook(() => useAppToast());

        result.current.showResult(true, 'Saved', 'Failed');

        expect(mockShow).toHaveBeenCalledWith('Saved', expect.objectContaining({
            type: 'success',
        }));
    });

    it('showResult shows error toast when result is false', () => {
        const { result } = renderHook(() => useAppToast());

        result.current.showResult(false, 'Saved', 'Failed');

        expect(mockShow).toHaveBeenCalledWith('Failed', expect.objectContaining({
            type: 'danger',
        }));
    });
});
