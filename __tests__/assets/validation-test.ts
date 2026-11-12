import {
    validateNonEmpty,
    validateNumber,
} from '../../assets/validation';

const VALIDATION_ERRORS = {
    REQUIRED: 'is required',
    CANNOT_BE_EMPTY: 'cannot be empty',
    INVALID_FORMAT: 'has invalid format',
} as const;

describe('Validation utilities', () => {
    describe('validateNonEmpty', () => {
        it('returns error for empty string', () => {
            const error = validateNonEmpty('', 'Name');
            expect(error).toBe(`Name ${VALIDATION_ERRORS.REQUIRED}`);
        });

        it('returns error for whitespace-only string', () => {
            const error = validateNonEmpty('   ', 'Email');
            expect(error).toBe(`Email ${VALIDATION_ERRORS.REQUIRED}`);
        });

        it('returns empty string for non-empty value', () => {
            const error = validateNonEmpty('valid input', 'Field');
            expect(error).toBe('');
        });
    });

    describe('validateNumber', () => {
        it('returns error for empty string', () => {
            const error = validateNumber('', 'Count');
            expect(error).toBe(`Count ${VALIDATION_ERRORS.CANNOT_BE_EMPTY}`);
        });

        it('returns error for non-numeric string', () => {
            const error = validateNumber('abc', 'Distance');
            expect(error).toBe(`Distance ${VALIDATION_ERRORS.INVALID_FORMAT}`);
        });

        it('returns empty string for numeric string', () => {
            const error = validateNumber('42', 'Value');
            expect(error).toBe('');
        });

        it('returns empty string for decimal string', () => {
            const error = validateNumber('3.14', 'Pi');
            expect(error).toBe('');
        });
    });
});
