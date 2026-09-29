import { renderHook, act } from '@testing-library/react-native';
import { useScorecardEdit } from '../../hooks/useScorecardEdit';

describe('useScorecardEdit', () => {
    it('initializes with all state false/null', () => {
        const { result } = renderHook(() => useScorecardEdit());

        expect(result.current.isEditing).toBe(false);
        expect(result.current.editedScores).toEqual([]);
        expect(result.current.selectedScore).toBeNull();
        expect(result.current.showSaveConfirm).toBe(false);
        expect(result.current.showDeleteConfirm).toBe(false);
        expect(result.current.editedSins).toBeNull();
        expect(result.current.sinsHoleNumber).toBeNull();
        expect(result.current.selectedOffTeeClub).toBeUndefined();
        expect(result.current.selectedPenaltyType).toBeUndefined();
        expect(result.current.puttingStats).toBeNull();
    });

    it('allows setting editing state', () => {
        const { result } = renderHook(() => useScorecardEdit());

        act(() => {
            result.current.setIsEditing(true);
        });

        expect(result.current.isEditing).toBe(true);
    });

    it('allows setting edited scores', () => {
        const { result } = renderHook(() => useScorecardEdit());
        const scores = [
            { Id: 1, HoleNumber: 1, RoundPlayerId: 1, Score: 4, HolePar: 4 },
        ];

        act(() => {
            result.current.setEditedScores(scores);
        });

        expect(result.current.editedScores).toEqual(scores);
    });

    it('allows setting selected score', () => {
        const { result } = renderHook(() => useScorecardEdit());
        const score = { holeNumber: 1, playerId: 1 };

        act(() => {
            result.current.setSelectedScore(score);
        });

        expect(result.current.selectedScore).toEqual(score);
    });

    it('allows setting sins state', () => {
        const { result } = renderHook(() => useScorecardEdit());
        const sins = { threePutts: true, doubleBogeys: false, bogeysPar5: false, bogeysInside9Iron: false, doubleChips: false, troubleOffTee: false, penalties: false };

        act(() => {
            result.current.setEditedSins(sins);
            result.current.setSinsHoleNumber(5);
        });

        expect(result.current.editedSins).toEqual(sins);
        expect(result.current.sinsHoleNumber).toBe(5);
    });

    it('allows setting club selections', () => {
        const { result } = renderHook(() => useScorecardEdit());

        act(() => {
            result.current.setSelectedOffTeeClub('9-iron');
            result.current.setSelectedPenaltyType('stroke');
            result.current.setSelectedBogeysClub('7-iron');
            result.current.setSelectedDoubleChipReason('poor contact');
        });

        expect(result.current.selectedOffTeeClub).toBe('9-iron');
        expect(result.current.selectedPenaltyType).toBe('stroke');
        expect(result.current.selectedBogeysClub).toBe('7-iron');
        expect(result.current.selectedDoubleChipReason).toBe('poor contact');
    });

    it('allows setting putting stats', () => {
        const { result } = renderHook(() => useScorecardEdit());
        const stats = { firstPutt: 15, secondPutt: 8, secondIsLong: false };

        act(() => {
            result.current.setPuttingStats(stats);
        });

        expect(result.current.puttingStats).toEqual(stats);
    });

    it('resets all editing state with resetEditState', () => {
        const { result } = renderHook(() => useScorecardEdit());

        act(() => {
            result.current.setIsEditing(true);
            result.current.setSelectedScore({ holeNumber: 1, playerId: 1 });
            result.current.setEditedSins({ threePutts: true, doubleBogeys: false, bogeysPar5: false, bogeysInside9Iron: false, doubleChips: false, troubleOffTee: false, penalties: false });
            result.current.setSinsHoleNumber(1);
        });

        expect(result.current.isEditing).toBe(true);

        act(() => {
            result.current.resetEditState();
        });

        expect(result.current.isEditing).toBe(false);
        expect(result.current.selectedScore).toBeNull();
        expect(result.current.editedSins).toBeNull();
        expect(result.current.sinsHoleNumber).toBeNull();
    });

    it('resets scorecard state after save', () => {
        const { result } = renderHook(() => useScorecardEdit());

        act(() => {
            result.current.setIsEditing(true);
            result.current.setShowSaveConfirm(true);
            result.current.setSelectedScore({ holeNumber: 1, playerId: 1 });
            result.current.setEditedSins({ threePutts: true, doubleBogeys: false, bogeysPar5: false, bogeysInside9Iron: false, doubleChips: false, troubleOffTee: false, penalties: false });
        });

        act(() => {
            result.current.resetScorecardAfterSave();
        });

        expect(result.current.isEditing).toBe(false);
        expect(result.current.showSaveConfirm).toBe(false);
        expect(result.current.selectedScore).toBeNull();
        expect(result.current.editedSins).toBeNull();
    });

    it('validates sin details correctly when all required fields present', () => {
        const { result } = renderHook(() => useScorecardEdit());
        const clubDistances = [{ ClubName: '9-iron', FullDist: 150 }];

        act(() => {
            result.current.setSelectedOffTeeClub('9-iron');
            result.current.setSelectedPenaltyType('stroke');
            result.current.setSelectedBogeysClub('7-iron');
            result.current.setSelectedDoubleChipReason('poor contact');
        });

        const isValid = result.current.validateSinDetails(clubDistances, true, true, true, true);

        expect(isValid).toBe(true);
        expect(result.current.sinDetailsClubError).toBe(false);
        expect(result.current.sinDetailsPenaltyError).toBe(false);
    });

    it('sets club error when trouble off tee needs club but none selected', () => {
        const { result } = renderHook(() => useScorecardEdit());
        const clubDistances = [{ ClubName: '9-iron', FullDist: 150 }];

        let isValid;
        act(() => {
            isValid = result.current.validateSinDetails(clubDistances, true, false, false, false);
        });

        expect(isValid).toBe(false);
        expect(result.current.sinDetailsClubError).toBe(true);
    });

    it('sets penalty error when penalty needs type but none selected', () => {
        const { result } = renderHook(() => useScorecardEdit());

        let isValid;
        act(() => {
            isValid = result.current.validateSinDetails([], false, true, false, false);
        });

        expect(isValid).toBe(false);
        expect(result.current.sinDetailsPenaltyError).toBe(true);
    });

    it('sets bogeys club error when bogeys needs club but none selected', () => {
        const { result } = renderHook(() => useScorecardEdit());
        const clubDistances = [{ ClubName: '9-iron', FullDist: 150 }];

        let isValid;
        act(() => {
            isValid = result.current.validateSinDetails(clubDistances, false, false, true, false);
        });

        expect(isValid).toBe(false);
        expect(result.current.sinDetailsBogeysClubError).toBe(true);
    });

    it('sets double chip error when double chip needs reason but none selected', () => {
        const { result } = renderHook(() => useScorecardEdit());

        let isValid;
        act(() => {
            isValid = result.current.validateSinDetails([], false, false, false, true);
        });

        expect(isValid).toBe(false);
        expect(result.current.sinDetailsDoubleChipReasonError).toBe(true);
    });

    it('allows confirming save/delete', () => {
        const { result } = renderHook(() => useScorecardEdit());

        act(() => {
            result.current.setShowSaveConfirm(true);
            result.current.setShowDeleteConfirm(true);
        });

        expect(result.current.showSaveConfirm).toBe(true);
        expect(result.current.showDeleteConfirm).toBe(true);
    });

    it('tracks prior sin details and putting stats', () => {
        const { result } = renderHook(() => useScorecardEdit());

        act(() => {
            result.current.setHadPriorSinDetails(true);
            result.current.setHadPriorPuttingStats(true);
        });

        expect(result.current.hadPriorSinDetails).toBe(true);
        expect(result.current.hadPriorPuttingStats).toBe(true);
    });
});
