import { loadCourseNotesService, saveHoleNoteService } from '../../service/DbService';
import { getAllHoleNotesForCourse, upsertHoleNote, deleteHoleNote } from '../../database/db';

jest.mock('../../database/db', () => ({
    getAllHoleNotesForCourse: jest.fn(),
    upsertHoleNote: jest.fn(),
    deleteHoleNote: jest.fn(),
}));

const mockGetAllHoleNotesForCourse = getAllHoleNotesForCourse as jest.Mock;
const mockUpsertHoleNote = upsertHoleNote as jest.Mock;
const mockDeleteHoleNote = deleteHoleNote as jest.Mock;

describe('loadCourseNotesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('callsDbWithCourseName', () => {
        mockGetAllHoleNotesForCourse.mockReturnValue([]);
        loadCourseNotesService('St Andrews');
        expect(mockGetAllHoleNotesForCourse).toHaveBeenCalledWith('St Andrews');
    });

    it('returnsMappedRecordOfHoleNumberToNote', () => {
        mockGetAllHoleNotesForCourse.mockReturnValue([
            { HoleNumber: 3, Note: 'aim left of bunker' },
            { HoleNumber: 7, Note: 'back pin plays longer' },
        ]);
        const result = loadCourseNotesService('St Andrews');
        expect(result).toEqual({ 3: 'aim left of bunker', 7: 'back pin plays longer' });
    });

    it('returnsEmptyRecordWhenNoNotes', () => {
        mockGetAllHoleNotesForCourse.mockReturnValue([]);
        const result = loadCourseNotesService('Unknown');
        expect(result).toEqual({});
    });
});

describe('saveHoleNoteService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUpsertHoleNote.mockResolvedValue(true);
        mockDeleteHoleNote.mockResolvedValue(true);
    });

    it('callsUpsertWhenNoteIsNonEmpty', async () => {
        await saveHoleNoteService('St Andrews', 7, 'aim left');
        expect(mockUpsertHoleNote).toHaveBeenCalledWith('St Andrews', 7, 'aim left');
        expect(mockDeleteHoleNote).not.toHaveBeenCalled();
    });

    it('callsDeleteWhenNoteIsEmpty', async () => {
        await saveHoleNoteService('St Andrews', 7, '');
        expect(mockDeleteHoleNote).toHaveBeenCalledWith('St Andrews', 7);
        expect(mockUpsertHoleNote).not.toHaveBeenCalled();
    });

    it('callsDeleteWhenNoteIsWhitespaceOnly', async () => {
        await saveHoleNoteService('St Andrews', 7, '   ');
        expect(mockDeleteHoleNote).toHaveBeenCalledWith('St Andrews', 7);
        expect(mockUpsertHoleNote).not.toHaveBeenCalled();
    });

    it('trimsNoteBeforeUpserting', async () => {
        await saveHoleNoteService('St Andrews', 7, '  aim left  ');
        expect(mockUpsertHoleNote).toHaveBeenCalledWith('St Andrews', 7, 'aim left');
    });

    it('returnsTrueOnSuccessfulUpsert', async () => {
        const result = await saveHoleNoteService('St Andrews', 7, 'aim left');
        expect(result).toBe(true);
    });

    it('returnsTrueOnSuccessfulDelete', async () => {
        const result = await saveHoleNoteService('St Andrews', 7, '');
        expect(result).toBe(true);
    });
});
