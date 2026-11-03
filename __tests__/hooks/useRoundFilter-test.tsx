import { renderHook, act } from '@testing-library/react-native';
import { useRoundFilter, resetRoundFilterStoreForTests } from '../../hooks/useRoundFilter';
import { getRoundFilterPreferenceService, saveRoundFilterPreferenceService } from '../../service/RoundFilterPreferenceService';

jest.mock('../../service/RoundFilterPreferenceService', () => ({
    getRoundFilterPreferenceService: jest.fn(),
    saveRoundFilterPreferenceService: jest.fn(),
}));

const mockGet = getRoundFilterPreferenceService as jest.Mock;
const mockSave = saveRoundFilterPreferenceService as jest.Mock;

describe('useRoundFilter shared store', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetRoundFilterStoreForTests();
        mockGet.mockReturnValue('all');
        mockSave.mockResolvedValue(true);
    });

    it('shouldStartFromTheSavedPreference', () => {
        mockGet.mockReturnValue(10);

        const { result } = renderHook(() => useRoundFilter());

        expect(result.current[0]).toBe(10);
    });

    it('shouldReadThePreferenceOnlyOnceAcrossConsumers', () => {
        renderHook(() => useRoundFilter());
        renderHook(() => useRoundFilter());

        expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('shouldUpdateEveryConsumerWhenOneChangesTheFilter', () => {
        const playScreen = renderHook(() => useRoundFilter());
        const performScreen = renderHook(() => useRoundFilter());

        act(() => { playScreen.result.current[1]({ year: 2026 }); });

        expect(performScreen.result.current[0]).toEqual({ year: 2026 });
        expect(playScreen.result.current[0]).toEqual({ year: 2026 });
    });

    it('shouldPersistEachRealChange', () => {
        const { result } = renderHook(() => useRoundFilter());

        act(() => { result.current[1](1); });

        expect(mockSave).toHaveBeenCalledWith(1);
    });

    it('shouldNotPersistOrNotifyWhenTheFilterIsUnchanged', () => {
        const { result } = renderHook(() => useRoundFilter());
        const before = result.current[0];

        act(() => { result.current[1]('all'); });

        expect(mockSave).not.toHaveBeenCalled();
        expect(result.current[0]).toBe(before);
    });

    it('shouldKeepTheInMemoryValueWhenSavingFails', () => {
        mockSave.mockRejectedValue(new Error('disk full'));
        const { result } = renderHook(() => useRoundFilter());

        act(() => { result.current[1](10); });

        expect(result.current[0]).toBe(10);
    });

    it('shouldReadThePreferenceAgainAfterAReset', () => {
        renderHook(() => useRoundFilter());
        resetRoundFilterStoreForTests();
        mockGet.mockReturnValue(1);

        const { result } = renderHook(() => useRoundFilter());

        expect(result.current[0]).toBe(1);
        expect(mockGet).toHaveBeenCalledTimes(2);
    });
});
