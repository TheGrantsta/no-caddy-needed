import {
    validateNonEmpty,
    validatePositiveNumber,
    validateRange,
    validateNumber,
    clearError,
    VALIDATION_ERRORS,
} from '../../assets/validation';

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

    describe('validatePositiveNumber', () => {
        it('returns error for zero', () => {
            const error = validatePositiveNumber(0, 'Amount');
            expect(error).toBe(`Amount ${VALIDATION_ERRORS.MUST_BE_POSITIVE}`);
        });

        it('returns error for negative number', () => {
            const error = validatePositiveNumber(-5, 'Distance');
            expect(error).toBe(`Distance ${VALIDATION_ERRORS.MUST_BE_POSITIVE}`);
        });

        it('returns error for non-numeric string', () => {
            const error = validatePositiveNumber('abc', 'Count');
            expect(error).toBe(`Count ${VALIDATION_ERRORS.MUST_BE_POSITIVE}`);
        });

        it('returns empty string for positive number', () => {
            const error = validatePositiveNumber(42, 'Value');
            expect(error).toBe('');
        });

        it('returns empty string for positive numeric string', () => {
            const error = validatePositiveNumber('3.14', 'Pi');
            expect(error).toBe('');
        });
    });

    describe('validateRange', () => {
        it('returns error for empty string', () => {
            const error = validateRange('', 'Range');
            expect(error).toBe(`Range ${VALIDATION_ERRORS.CANNOT_BE_EMPTY}`);
        });

        it('returns error for invalid format', () => {
            const error = validateRange('100', 'Range');
            expect(error).toBe(`Range ${VALIDATION_ERRORS.INVALID_FORMAT}`);
        });

        it('returns empty string for valid range format', () => {
            const error = validateRange('30-100', 'Range');
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

    describe('clearError', () => {
        it('returns empty string for non-empty error', () => {
            const result = clearError('Some error');
            expect(result).toBe('');
        });

        it('returns empty string for empty error', () => {
            const result = clearError('');
            expect(result).toBe('');
        });
    });
});
