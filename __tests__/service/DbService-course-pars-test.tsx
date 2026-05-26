import { getCourseHoleParsService } from '../../service/DbService';
import { getHoleParsForCourse } from '../../database/db';

jest.mock('../../database/db', () => ({
    getHoleParsForCourse: jest.fn(),
}));

const mockGetHoleParsForCourse = getHoleParsForCourse as jest.Mock;

describe('getCourseHoleParsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('callsDbWithCourseName', () => {
        mockGetHoleParsForCourse.mockReturnValue([]);
        getCourseHoleParsService('St Andrews');
        expect(mockGetHoleParsForCourse).toHaveBeenCalledWith('St Andrews');
    });

    it('returnsMappedRecordOfHoleNumberToPar', () => {
        mockGetHoleParsForCourse.mockReturnValue([
            { HoleNumber: 1, HolePar: 3 },
            { HoleNumber: 2, HolePar: 5 },
        ]);
        const result = getCourseHoleParsService('Augusta');
        expect(result).toEqual({ 1: 3, 2: 5 });
    });

    it('returnsEmptyRecordWhenNoData', () => {
        mockGetHoleParsForCourse.mockReturnValue([]);
        const result = getCourseHoleParsService('Unknown');
        expect(result).toEqual({});
    });
});
