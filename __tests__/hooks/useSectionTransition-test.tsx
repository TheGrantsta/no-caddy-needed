import { renderHook, act } from '@testing-library/react-native';
import { useSectionTransition } from '../../hooks/useSectionTransition';

describe('useSectionTransition', () => {
    it('initializes with first section', () => {
        const sectionOrder = ['home', 'details', 'history'];
        const { result } = renderHook(() => useSectionTransition(sectionOrder));

        expect(result.current.section).toBe('home');
    });

    it('displays the current section', () => {
        const sectionOrder = ['home', 'details', 'history'];
        const { result } = renderHook(() => useSectionTransition(sectionOrder));

        expect(result.current.displaySection('home')).toBe(true);
        expect(result.current.displaySection('details')).toBe(false);
    });

    it('navigates forward to next section', () => {
        const sectionOrder = ['home', 'details', 'history'];
        const { result } = renderHook(() => useSectionTransition(sectionOrder));

        act(() => {
            result.current.handleSubMenu('details');
        });

        expect(result.current.section).toBe('details');
        expect(result.current.displaySection('details')).toBe(true);
    });

    it('navigates backward to previous section', () => {
        const sectionOrder = ['home', 'details', 'history'];
        const { result } = renderHook(() => useSectionTransition(sectionOrder));

        act(() => {
            result.current.handleSubMenu('details');
        });
        expect(result.current.section).toBe('details');

        act(() => {
            result.current.handleSubMenu('home');
        });

        expect(result.current.section).toBe('home');
    });

    it('wraps around at end to beginning', () => {
        const sectionOrder = ['home', 'details', 'history'];
        const { result } = renderHook(() => useSectionTransition(sectionOrder));

        act(() => {
            result.current.handleSubMenu('details');
        });
        act(() => {
            result.current.handleSubMenu('history');
        });
        expect(result.current.section).toBe('history');

        act(() => {
            result.current.handleSubMenu('home');
        });

        expect(result.current.section).toBe('home');
    });

    it('returns animation refs', () => {
        const sectionOrder = ['home', 'details'];
        const { result } = renderHook(() => useSectionTransition(sectionOrder));

        expect(result.current.fadeAnim).toBeDefined();
        expect(result.current.slideAnim).toBeDefined();
    });
});
