import { hideCourseFromRecentsService } from '../../service/DbService';
import { addHiddenRecent } from '../../database/db';

jest.mock('../../database/db', () => ({
    addHiddenRecent: jest.fn(),
}));

const mockAddHiddenRecent = addHiddenRecent as jest.Mock;

describe('hideCourseFromRecentsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('callsAddHiddenRecentWithCourseTypeAndName', async () => {
        mockAddHiddenRecent.mockResolvedValue(true);
        await hideCourseFromRecentsService('St Andrews');
        expect(mockAddHiddenRecent).toHaveBeenCalledWith('course', 'St Andrews');
    });

    it('returnsTrueOnSuccess', async () => {
        mockAddHiddenRecent.mockResolvedValue(true);
        const result = await hideCourseFromRecentsService('St Andrews');
        expect(result).toBe(true);
    });

    it('returnsFalseOnFailure', async () => {
        mockAddHiddenRecent.mockResolvedValue(false);
        const result = await hideCourseFromRecentsService('St Andrews');
        expect(result).toBe(false);
    });
});
